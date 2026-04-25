#!/usr/bin/env bash
# =============================================================================
#  IKEA Jobs — Full Server Installation Script
#  Target: Ubuntu 24 LTS
#  Usage:  sudo bash install.sh
# =============================================================================
set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "${GREEN}  ✓  $*${NC}"; }
info() { echo -e "${CYAN}  →  $*${NC}"; }
warn() { echo -e "${YELLOW}  ⚠  $*${NC}"; }
die()  { echo -e "${RED}  ✗  $*${NC}" >&2; exit 1; }
hdr()  { echo -e "\n${BOLD}${BLUE}══ $* ══${NC}\n"; }
ask()  { echo -e "${YELLOW}  ?  $*${NC}"; }

# ── Constants ─────────────────────────────────────────────────────────────────
REPO_URL="https://github.com/yaakovsc/ikeaj.git"
INSTALL_DIR="/opt/ikea-jobs"
NETWORK_NAME="web"
HEALTH_TIMEOUT=60   # seconds to wait for containers to become healthy

# =============================================================================
#  STEP 0 — Must run as root
# =============================================================================
hdr "STEP 0 — Permission check"
[[ $EUID -eq 0 ]] || die "Run this script as root:  sudo bash install.sh"
ok "Running as root"

# =============================================================================
#  STEP 1 — Collect configuration
# =============================================================================
hdr "STEP 1 — Configuration"

ask "Recruiter email address [yaakovsc@gmail.com]:"
read -r _input; RECIPIENT_EMAIL="${_input:-yaakovsc@gmail.com}"
ok "  RECIPIENT_EMAIL=$RECIPIENT_EMAIL"

ask "Gmail sender address [mailermechanism@gmail.com]:"
read -r _input; EMAIL_USER="${_input:-mailermechanism@gmail.com}"
ok "  EMAIL_USER=$EMAIL_USER"

ask "Gmail App Password [tcrdwckwlhalurlz]:"
read -rs _input; echo; EMAIL_PASS="${_input:-tcrdwckwlhalurlz}"
ok "  EMAIL_PASS=*** (set)"

ask "ADAM API base URL [PENDING — leave empty or press Enter to skip for now]:"
read -r _input; ADAM_API_BASE_URL="${_input:-PENDING}"
ok "  ADAM_API_BASE_URL=$ADAM_API_BASE_URL"

ask "ADAM API token [PENDING — leave empty or press Enter to skip for now]:"
read -rs _input; echo; ADAM_API_TOKEN="${_input:-PENDING}"
ok "  ADAM_API_TOKEN=*** (set)"

echo
if command -v docker &>/dev/null && docker ps &>/dev/null; then
    echo -e "${CYAN}  Running Docker containers:${NC}"
    docker ps --format "  • {{.Names}}\t({{.Image}})" | grep -i nginx || \
    docker ps --format "  • {{.Names}}\t({{.Image}})"
    echo
fi
ask "Name of your existing nginx Docker container (press Enter to skip if none):"
read -r NGINX_CONTAINER

ok "Configuration collected"

# =============================================================================
#  STEP 2 — Install system dependencies
# =============================================================================
hdr "STEP 2 — System dependencies"

apt_install() {
    local pkg=$1
    if dpkg -s "$pkg" &>/dev/null; then
        ok "$pkg already installed"
    else
        info "Installing $pkg…"
        apt-get install -y -q "$pkg"
        ok "$pkg installed"
    fi
}

info "Updating package index…"
apt-get update -q

apt_install curl
apt_install git
apt_install ca-certificates
apt_install gnupg
apt_install lsb-release
apt_install ufw

# Allow outbound SMTP (port 587) for Gmail email delivery
if command -v ufw &>/dev/null; then
    ufw allow out 587/tcp &>/dev/null || true
    ok "Outbound SMTP (port 587) allowed in firewall"
fi

# ── Docker ───────────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
    ok "Docker already installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
    info "Installing Docker…"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -q
    apt-get install -y -q docker-ce docker-ce-cli containerd.io \
                          docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    ok "Docker installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
fi

# ── Docker Compose (plugin) ───────────────────────────────────────────────────
if docker compose version &>/dev/null; then
    ok "Docker Compose already available ($(docker compose version --short))"
else
    die "Docker Compose plugin not found — please install docker-compose-plugin"
fi

# =============================================================================
#  STEP 3 — Clone / update repository
# =============================================================================
hdr "STEP 3 — Repository"

if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Repo already cloned — pulling latest…"
    git -C "$INSTALL_DIR" pull --ff-only
    ok "Repository updated"
else
    info "Cloning $REPO_URL → $INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
    ok "Repository cloned"
fi

cd "$INSTALL_DIR"

# =============================================================================
#  STEP 4 — Write .env files
# =============================================================================
hdr "STEP 4 — Environment files"

cat > ikea-jobs-server/.env <<EOF
PORT=3001
RECIPIENT_EMAIL=${RECIPIENT_EMAIL}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EOF
ok "ikea-jobs-server/.env written"

cat > ikea-email-service/.env <<EOF
PORT=3002
ADAM_API_BASE_URL=${ADAM_API_BASE_URL}
ADAM_API_TOKEN=${ADAM_API_TOKEN}
EOF
ok "ikea-email-service/.env written"

# Ensure last_fetch.txt and config.json exist for volume mounts
touch ikea-email-service/last_fetch.txt
if [[ ! -f ikea-email-service/config.json ]]; then
    echo '{"refreshMinutes":30}' > ikea-email-service/config.json
fi
ok "Volume files ready (last_fetch.txt, config.json)"

# =============================================================================
#  STEP 5 — Docker network
# =============================================================================
hdr "STEP 5 — Docker network"

if docker network inspect "$NETWORK_NAME" &>/dev/null; then
    ok "Network '$NETWORK_NAME' already exists"
else
    docker network create "$NETWORK_NAME"
    ok "Network '$NETWORK_NAME' created"
fi

# Connect existing nginx container to the shared network
if [[ -n "$NGINX_CONTAINER" ]]; then
    if docker inspect "$NGINX_CONTAINER" &>/dev/null; then
        if docker network inspect "$NETWORK_NAME" \
                --format '{{range .Containers}}{{.Name}} {{end}}' \
                | grep -qw "$NGINX_CONTAINER"; then
            ok "Nginx container '$NGINX_CONTAINER' already on network '$NETWORK_NAME'"
        else
            docker network connect "$NETWORK_NAME" "$NGINX_CONTAINER"
            ok "Connected '$NGINX_CONTAINER' to network '$NETWORK_NAME'"
        fi
    else
        warn "Container '$NGINX_CONTAINER' not found — skipping network connect"
    fi
else
    warn "No nginx container specified — skipping network connect"
fi

# =============================================================================
#  STEP 6 — Build & start containers
# =============================================================================
hdr "STEP 6 — Build & start"

info "Building images (this may take a few minutes)…"
docker compose build --no-cache 2>&1 | while IFS= read -r line; do
    echo "    $line"
done
ok "Images built"

info "Starting containers…"
docker compose up -d
ok "Containers started"

# =============================================================================
#  STEP 7 — Health checks
# =============================================================================
hdr "STEP 7 — Health checks"

wait_for_container() {
    local service=$1
    local container
    container=$(docker compose ps -q "$service" 2>/dev/null | head -1)
    if [[ -z "$container" ]]; then
        die "Container for service '$service' not found"
    fi

    local elapsed=0
    while [[ $elapsed -lt $HEALTH_TIMEOUT ]]; do
        local status
        status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        if [[ "$status" == "running" ]]; then
            ok "Service '$service' is running"
            return 0
        fi
        sleep 2; ((elapsed+=2))
    done
    die "Service '$service' did not start within ${HEALTH_TIMEOUT}s (status: $status)"
}

wait_for_container frontend
wait_for_container jobs-server
wait_for_container email-service

# ── HTTP reachability checks (internal) ───────────────────────────────────────
check_http() {
    local label=$1 container=$2 port=$3 path=$4
    local ip
    ip=$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
         "$(docker compose ps -q "$container" | head -1)" 2>/dev/null | awk '{print $1}')

    if [[ -z "$ip" ]]; then
        warn "Could not determine IP for '$container' — skipping HTTP check"
        return
    fi

    local url="http://${ip}:${port}${path}"
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")

    if [[ "$http_code" =~ ^(200|301|302|304)$ ]]; then
        ok "$label responded HTTP $http_code"
    else
        warn "$label returned HTTP $http_code (may still be starting up)"
    fi
}

info "Waiting 5s for services to finish initialising…"
sleep 5

check_http "Frontend"     frontend     80   "/"
check_http "Jobs server"  jobs-server  3001 "/api/send-application"
check_http "Email service" email-service 3002 "/api/fetch-jobs"

# =============================================================================
#  STEP 8 — Patch giron nginx config automatically
# =============================================================================
hdr "STEP 8 — Nginx configuration"

if [[ -z "$NGINX_CONTAINER" ]]; then
    warn "No nginx container specified — skipping nginx config patch."
    warn "Add the blocks from nginx-ikea.conf manually, then reload nginx."
else
    # ── Find the nginx.conf path from the container's bind mounts ────────────
    NGINX_CONF=$(docker inspect "$NGINX_CONTAINER" \
        --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/nginx.conf"}}{{.Source}}{{end}}{{end}}' \
        2>/dev/null)

    if [[ -z "$NGINX_CONF" ]]; then
        warn "Could not detect nginx.conf path from container mounts."
        warn "Add the blocks from nginx-ikea.conf manually, then reload nginx."
    elif [[ ! -f "$NGINX_CONF" ]]; then
        warn "nginx.conf not found at $NGINX_CONF — skipping auto-patch."
    else
        info "Found nginx config: $NGINX_CONF"

        # ── Idempotency check ─────────────────────────────────────────────────
        if grep -q "ikea-frontend" "$NGINX_CONF"; then
            ok "IKEA blocks already present in nginx config — skipping patch"
        else
            info "Backing up nginx config…"
            cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
            ok "Backup saved"

            info "Patching nginx config…"
            python3 - "$NGINX_CONF" << 'PYEOF'
import sys, re

path = sys.argv[1]
with open(path) as f:
    content = f.read()

UPSTREAMS = """
    upstream ikea-frontend      { server ikea-frontend:80;         keepalive 16; }
    upstream ikea-jobs-server   { server ikea-jobs-server:3001;    keepalive 16; }
    upstream ikea-email-service { server ikea-email-service:3002;  keepalive 16; }
"""

LOCATIONS = """
        # ─── IKEA Jobs app ───────────────────────────────────────
        location /ikea/ {
            proxy_pass         http://ikea-frontend/;
            proxy_http_version 1.1;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            add_header         X-Frame-Options   "SAMEORIGIN" always;
        }

        location /ikea/api/jobs/ {
            proxy_pass         http://ikea-email-service/;
            proxy_http_version 1.1;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        location /ikea/api/apply/ {
            proxy_pass         http://ikea-jobs-server/;
            proxy_http_version 1.1;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Forwarded-Proto $scheme;
            client_max_body_size 6M;
        }

"""

# Insert upstreams after last upstream block closing brace
last_upstream = [m.end() for m in re.finditer(r'upstream\s+\w+\s*\{[^}]*\}', content)]
if not last_upstream:
    print("ERROR: no upstream blocks found in nginx.conf", file=sys.stderr)
    sys.exit(1)
insert_at = last_upstream[-1]
content = content[:insert_at] + "\n" + UPSTREAMS + content[insert_at:]

# Insert location blocks before first bare "location /" block
match = re.search(r'(\n[ \t]+location\s+/\s*\{)', content)
if not match:
    print("ERROR: could not find 'location /' in nginx.conf", file=sys.stderr)
    sys.exit(1)
insert_at = match.start()
content = content[:insert_at] + "\n" + LOCATIONS + content[insert_at:]

with open(path, 'w') as f:
    f.write(content)

print("OK")
PYEOF

            ok "nginx.conf patched"

            # ── Test config ───────────────────────────────────────────────────
            info "Testing nginx config…"
            if docker exec "$NGINX_CONTAINER" nginx -t 2>&1; then
                ok "nginx config test passed"
                docker exec "$NGINX_CONTAINER" nginx -s reload
                ok "nginx reloaded — IKEA app is live"
            else
                warn "nginx config test FAILED — restoring backup"
                cp "${NGINX_CONF}.bak."* "$NGINX_CONF" 2>/dev/null || true
                die "nginx config invalid. Original restored. Check logs above."
            fi
        fi
    fi
fi

# =============================================================================
#  STEP 9 — Seed test job data
# =============================================================================
hdr "STEP 9 — Test job data"

ask "Inject test job data into the database? Useful if ADAM is not yet connected. [y/N]:"
read -r SEED_DATA
if [[ "${SEED_DATA,,}" == "y" ]]; then
    ask "How many test jobs to generate? [15]:"
    read -r _input; SEED_COUNT="${_input:-15}"
    info "Running seed script ($SEED_COUNT jobs)…"
    docker compose exec -T email-service node seed-jobs.js "$SEED_COUNT"
    ok "$SEED_COUNT test jobs injected — restart not needed"
else
    info "Skipped seed — app will fetch live jobs from ADAM"
fi

# =============================================================================
#  Summary
# =============================================================================
hdr "Installation complete"

echo -e "${BOLD}Running containers:${NC}"
docker compose ps

echo
echo -e "${BOLD}Container logs (last 5 lines each):${NC}"
for svc in frontend jobs-server email-service; do
    echo -e "${CYAN}── $svc ──${NC}"
    docker compose logs --tail=5 "$svc" 2>/dev/null || true
done

echo
ok "IKEA Jobs app is up."
echo -e "${BOLD}  App URL:   ${GREEN}https://yourdomain.com/ikea${NC}"
echo -e "${BOLD}  Manage:    ${CYAN}cd ${INSTALL_DIR} && docker compose [ps|logs|down]${NC}"
echo -e "${BOLD}  Update:    ${CYAN}cd ${INSTALL_DIR} && git pull && docker compose up -d --build${NC}"
echo
