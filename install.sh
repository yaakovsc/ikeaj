#!/usr/bin/env bash
# =============================================================================
#  IKEA Jobs — Full Server Installation Script
#  Supports: Ubuntu, Debian, Fedora, RHEL / AlmaLinux / Rocky
#  Modes:    standalone (built-in nginx + Let's Encrypt SSL)
#            giron      (attach to an existing nginx Docker container)
#  Usage:    sudo bash install.sh
# =============================================================================
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
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
HEALTH_TIMEOUT=60

# =============================================================================
#  STEP 0 — Must run as root
# =============================================================================
hdr "STEP 0 — Permission check"
[[ $EUID -eq 0 ]] || die "Run this script as root:  sudo bash install.sh"
ok "Running as root"

# =============================================================================
#  STEP 1 — OS detection
# =============================================================================
hdr "STEP 1 — OS detection"

[[ -f /etc/os-release ]] || die "Cannot detect OS — /etc/os-release not found"
. /etc/os-release
OS_ID="${ID}"
OS_LIKE="${ID_LIKE:-}"

case "$OS_ID" in
    ubuntu)                          PKG_MANAGER="apt-ubuntu"; ok "Detected: Ubuntu ${VERSION_ID:-}" ;;
    debian)                          PKG_MANAGER="apt-debian"; ok "Detected: Debian ${VERSION_ID:-}" ;;
    fedora)                          PKG_MANAGER="dnf-fedora"; ok "Detected: Fedora ${VERSION_ID:-}" ;;
    rhel|centos|almalinux|rocky)     PKG_MANAGER="dnf-rhel";  ok "Detected: ${PRETTY_NAME:-$OS_ID}" ;;
    *)
        if echo "$OS_LIKE" | grep -q "debian"; then
            PKG_MANAGER="apt-debian"; warn "Unknown OS ($OS_ID) — treating as Debian"
        elif echo "$OS_LIKE" | grep -q "fedora\|rhel"; then
            PKG_MANAGER="dnf-rhel";  warn "Unknown OS ($OS_ID) — treating as RHEL-like"
        else
            die "Unsupported OS: $OS_ID (ID_LIKE='$OS_LIKE'). Supported: Ubuntu, Debian, Fedora, RHEL/AlmaLinux/Rocky"
        fi
        ;;
esac

# helpers
is_apt() { [[ "$PKG_MANAGER" == apt-* ]]; }
is_dnf() { [[ "$PKG_MANAGER" == dnf-* ]]; }

pkg_install() {
    if is_apt; then
        for pkg in "$@"; do
            if dpkg -s "$pkg" &>/dev/null; then
                ok "$pkg already installed"
            else
                info "Installing $pkg…"
                DEBIAN_FRONTEND=noninteractive apt-get install -y -q "$pkg"
                ok "$pkg installed"
            fi
        done
    else
        for pkg in "$@"; do
            if rpm -q "$pkg" &>/dev/null; then
                ok "$pkg already installed"
            else
                info "Installing $pkg…"
                dnf install -y -q "$pkg"
                ok "$pkg installed"
            fi
        done
    fi
}

# =============================================================================
#  STEP 2 — Deployment mode
# =============================================================================
hdr "STEP 2 — Deployment mode"

echo -e "${CYAN}  Choose how this server will be set up:${NC}"
echo
echo "    1) standalone  — No nginx on this server yet."
echo "                     The script will install nginx inside Docker and"
echo "                     obtain a free SSL certificate via Let's Encrypt."
echo
echo "    2) giron       — An nginx Docker container already runs on this server"
echo "                     (e.g. Giron Security). The script will attach to it."
echo
ask "Enter 1 or 2 [1]:"
read -r _mode_input
_mode_input="${_mode_input:-1}"
[[ "$_mode_input" =~ ^[12]$ ]] || die "Invalid choice: $_mode_input"
[[ "$_mode_input" == "1" ]] && MODE="standalone" || MODE="giron"
ok "Mode: $MODE"

# =============================================================================
#  STEP 3 — Configuration
# =============================================================================
hdr "STEP 3 — Configuration"

# ── Domain (standalone only) ──────────────────────────────────────────────────
if [[ "$MODE" == "standalone" ]]; then
    echo
    ask "Domain name pointing to this server (e.g. jobs.mycompany.com):"
    echo "    The domain MUST already point to this server's IP in DNS."
    read -r DOMAIN
    [[ -n "$DOMAIN" ]] || die "Domain name is required in standalone mode"

    info "Checking DNS for $DOMAIN…"
    SERVER_IP=$(curl -s --max-time 5 https://ipinfo.io/ip 2>/dev/null \
                || hostname -I | awk '{print $1}')
    DOMAIN_IP=$(getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1}' || echo "")

    if [[ -n "$DOMAIN_IP" && "$DOMAIN_IP" == "$SERVER_IP" ]]; then
        ok "DNS OK: $DOMAIN → $DOMAIN_IP"
    else
        warn "DNS check: $DOMAIN resolves to '${DOMAIN_IP:-not found}', server IP is '$SERVER_IP'"
        warn "If the domain does not point here, Let's Encrypt will fail."
        ask "Continue anyway? [y/N]:"
        read -r _cont; [[ "${_cont,,}" == "y" ]] || die "Aborted — fix DNS first, then re-run."
    fi
fi

echo

# ── Recruiter email ───────────────────────────────────────────────────────────
echo -e "${CYAN}  Recruiter email — job applications are forwarded here.${NC}"
ask "Recruiter email address:"
read -r RECIPIENT_EMAIL
[[ -n "$RECIPIENT_EMAIL" ]] || die "Recruiter email is required"
ok "  RECIPIENT_EMAIL=$RECIPIENT_EMAIL"

echo

# ── Gmail SMTP ────────────────────────────────────────────────────────────────
echo -e "${CYAN}  Gmail sender account — used to send emails to candidates and the recruiter.${NC}"
echo "  Requires a Gmail App Password (NOT your regular Gmail password)."
echo "  Setup: Google Account → Security → 2-Step Verification → App passwords"
echo
ask "Gmail address (the account that sends emails):"
read -r EMAIL_USER
[[ -n "$EMAIL_USER" ]] || die "Gmail address is required"
ok "  EMAIL_USER=$EMAIL_USER"

ask "Gmail App Password (16 characters, no spaces):"
read -rs EMAIL_PASS; echo
[[ -n "$EMAIL_PASS" ]] || die "Gmail App Password is required"
ok "  EMAIL_PASS=*** (set)"

echo

# ── ADAM API ──────────────────────────────────────────────────────────────────
echo -e "${CYAN}  ADAM HR API — source of job listings. Credentials from IKEA IT.${NC}"
ask "ADAM API base URL [https://services.adamtotal.co.il/api/]:"
read -r _input; ADAM_API_BASE_URL="${_input:-https://services.adamtotal.co.il/api/}"
ok "  ADAM_API_BASE_URL=$ADAM_API_BASE_URL"

ask "ADAM API token (press Enter to set later — use seed data in the meantime):"
read -rs _input; echo; ADAM_API_TOKEN="${_input:-PENDING}"
ok "  ADAM_API_TOKEN=*** (set)"

echo

# ── Existing nginx container (giron only) ─────────────────────────────────────
NGINX_CONTAINER=""
if [[ "$MODE" == "giron" ]]; then
    echo -e "${CYAN}  Existing nginx container — the script will join it to the Docker network${NC}"
    echo "  and patch its config to route /ikea/* traffic to the IKEA containers."
    echo
    if command -v docker &>/dev/null && docker ps &>/dev/null 2>&1; then
        echo -e "${CYAN}  Running Docker containers:${NC}"
        docker ps --format "  • {{.Names}}\t({{.Image}})"
        echo
    fi
    ask "Name of your nginx Docker container (press Enter to skip if not applicable):"
    read -r NGINX_CONTAINER
fi

ok "Configuration collected"

# =============================================================================
#  STEP 4 — System dependencies
# =============================================================================
hdr "STEP 4 — System dependencies"

if is_apt; then
    info "Updating package index…"
    apt-get update -q
    pkg_install curl git ca-certificates gnupg ufw python3
else
    info "Checking for updates…"
    dnf check-update -q || true
    pkg_install curl git ca-certificates python3
fi

# =============================================================================
#  STEP 5 — Docker
# =============================================================================
hdr "STEP 5 — Docker"

if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    ok "Docker already installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
    info "Installing Docker Engine…"
    if is_apt; then
        install -m 0755 -d /etc/apt/keyrings
        if [[ "$OS_ID" == "ubuntu" ]]; then
            DOCKER_REPO_URL="https://download.docker.com/linux/ubuntu"
        else
            DOCKER_REPO_URL="https://download.docker.com/linux/debian"
        fi
        curl -fsSL "${DOCKER_REPO_URL}/gpg" \
            | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
          ${DOCKER_REPO_URL} $(lsb_release -cs) stable" \
          > /etc/apt/sources.list.d/docker.list
        apt-get update -q
        DEBIAN_FRONTEND=noninteractive apt-get install -y -q \
            docker-ce docker-ce-cli containerd.io \
            docker-buildx-plugin docker-compose-plugin
    else
        # Fedora / RHEL
        dnf remove -y docker docker-client docker-client-latest docker-common \
                      docker-latest docker-latest-logrotate docker-logrotate \
                      docker-engine podman runc 2>/dev/null || true
        if [[ "$OS_ID" == "fedora" ]]; then
            dnf config-manager --add-repo \
                https://download.docker.com/linux/fedora/docker-ce.repo
        else
            dnf config-manager --add-repo \
                https://download.docker.com/linux/rhel/docker-ce.repo
        fi
        dnf install -y docker-ce docker-ce-cli containerd.io \
                       docker-buildx-plugin docker-compose-plugin
    fi
    systemctl enable --now docker
    ok "Docker installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
fi

docker compose version &>/dev/null \
    || die "Docker Compose plugin not found — reinstall Docker Engine"
ok "Docker Compose $(docker compose version --short) ready"

# =============================================================================
#  STEP 6 — Firewall
# =============================================================================
hdr "STEP 6 — Firewall"

if is_apt; then
    # ufw (Ubuntu / Debian)
    if command -v ufw &>/dev/null; then
        ufw allow out 587/tcp &>/dev/null || true
        ok "Outbound SMTP port 587 allowed"
        if [[ "$MODE" == "standalone" ]]; then
            ufw allow 80/tcp  &>/dev/null || true
            ufw allow 443/tcp &>/dev/null || true
            ok "Inbound HTTP (80) and HTTPS (443) allowed"
        fi
    else
        warn "ufw not found — skipping firewall setup"
    fi
else
    # firewalld (Fedora / RHEL)
    if systemctl is-active --quiet firewalld 2>/dev/null; then
        firewall-cmd --permanent --add-port=587/tcp &>/dev/null || true
        ok "Outbound SMTP port 587 allowed"
        if [[ "$MODE" == "standalone" ]]; then
            firewall-cmd --permanent --add-service=http  &>/dev/null || true
            firewall-cmd --permanent --add-service=https &>/dev/null || true
            ok "Inbound HTTP (80) and HTTPS (443) allowed"
        fi
        firewall-cmd --reload &>/dev/null || true
    else
        warn "firewalld is not running — skipping firewall setup"
    fi
fi

# =============================================================================
#  STEP 7 — Repository
# =============================================================================
hdr "STEP 7 — Repository"

if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Repo already present — pulling latest…"
    git -C "$INSTALL_DIR" pull --ff-only
    ok "Repository updated"
else
    info "Cloning $REPO_URL → $INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
    ok "Repository cloned"
fi

cd "$INSTALL_DIR"

# =============================================================================
#  STEP 8 — Environment file
# =============================================================================
hdr "STEP 8 — Environment file"

cat > .env <<EOF
# ── Email / Gmail SMTP ─────────────────────────────────────────────────────
RECIPIENT_EMAIL=${RECIPIENT_EMAIL}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}

# ── ADAM HR API ────────────────────────────────────────────────────────────
ADAM_API_BASE_URL=${ADAM_API_BASE_URL}
ADAM_API_TOKEN=${ADAM_API_TOKEN}
EOF
ok ".env written to $INSTALL_DIR/.env"

# Ensure volume mount files exist
touch ikea-adam-service/last_fetch.txt
[[ -f ikea-adam-service/config.json ]] \
    || echo '{"refreshMinutes":30}' > ikea-adam-service/config.json
ok "Volume files ready (last_fetch.txt, config.json)"

# =============================================================================
#  STEP 9 — SSL certificate   (standalone only)
# =============================================================================
if [[ "$MODE" == "standalone" ]]; then
    hdr "STEP 9 — SSL certificate (Let's Encrypt)"

    # Install certbot on host for initial issuance
    if ! command -v certbot &>/dev/null; then
        info "Installing certbot…"
        if is_apt; then
            DEBIAN_FRONTEND=noninteractive apt-get install -y -q certbot
        else
            dnf install -y -q certbot
        fi
        ok "certbot installed"
    else
        ok "certbot already installed"
    fi

    if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
        ok "SSL certificate already exists for $DOMAIN — skipping"
    else
        info "Obtaining certificate for $DOMAIN from Let's Encrypt…"
        info "(certbot will temporarily listen on port 80)"

        certbot certonly \
            --standalone \
            --non-interactive \
            --agree-tos \
            --email "${EMAIL_USER}" \
            -d "${DOMAIN}" \
            || die "certbot failed — ensure $DOMAIN points to this server and port 80 is free"

        ok "SSL certificate obtained for $DOMAIN"
    fi
fi

# =============================================================================
#  STEP 10 — Generate nginx config   (standalone only)
# =============================================================================
if [[ "$MODE" == "standalone" ]]; then
    hdr "STEP 10 — nginx configuration"

    cat > nginx-ikea-standalone.conf <<NGINXEOF
# IKEA Jobs — standalone nginx — generated by install.sh
# Domain: ${DOMAIN}

# HTTP: redirect to HTTPS + serve ACME challenges for cert renewal
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # ── IKEA Jobs frontend ──────────────────────────────────────────────────
    location /ikea/ {
        proxy_pass         http://ikea-frontend/;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        add_header         X-Frame-Options   "SAMEORIGIN" always;
    }

    # ── ADAM job listings ───────────────────────────────────────────────────
    location /ikea/api/jobs/ {
        proxy_pass         http://ikea-adam-service/;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    # ── Application submissions ─────────────────────────────────────────────
    location /ikea/api/apply/ {
        proxy_pass         http://ikea-jobs-server/;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        client_max_body_size 6M;
    }

    location / {
        return 404;
    }
}
NGINXEOF
    ok "nginx config written → nginx-ikea-standalone.conf"
fi

# =============================================================================
#  STEP 11 — Docker network   (giron only — standalone network is in compose)
# =============================================================================
if [[ "$MODE" == "giron" ]]; then
    hdr "STEP 11 — Docker network"

    NETWORK_NAME="web"
    if docker network inspect "$NETWORK_NAME" &>/dev/null; then
        ok "Network '$NETWORK_NAME' already exists"
    else
        docker network create "$NETWORK_NAME"
        ok "Network '$NETWORK_NAME' created"
    fi

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
        warn "No nginx container name provided — skipping network connect"
    fi
fi

# =============================================================================
#  STEP 12 — Build & start
# =============================================================================
hdr "STEP 12 — Build & start"

# Build compose command array based on mode
if [[ "$MODE" == "standalone" ]]; then
    COMPOSE=(docker compose -f docker-compose.standalone.yml)
else
    COMPOSE=(docker compose)
fi

info "Building Docker images (this may take several minutes)…"
"${COMPOSE[@]}" build --no-cache 2>&1 | while IFS= read -r line; do
    echo "    $line"
done
ok "Images built"

info "Starting containers…"
"${COMPOSE[@]}" up -d
ok "Containers started"

# =============================================================================
#  STEP 13 — Health checks
# =============================================================================
hdr "STEP 13 — Health checks"

wait_for_container() {
    local service=$1
    local container elapsed=0 status
    container=$("${COMPOSE[@]}" ps -q "$service" 2>/dev/null | head -1)
    [[ -n "$container" ]] || die "Container for service '$service' not found"

    while [[ $elapsed -lt $HEALTH_TIMEOUT ]]; do
        status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null \
                 || echo "unknown")
        if [[ "$status" == "running" ]]; then
            ok "Service '$service' is running"
            return 0
        fi
        sleep 2; (( elapsed += 2 ))
    done
    die "Service '$service' did not start within ${HEALTH_TIMEOUT}s (status: $status)"
}

check_http() {
    local label=$1 service=$2 port=$3 path=$4
    local container ip http_code
    container=$("${COMPOSE[@]}" ps -q "$service" 2>/dev/null | head -1)
    ip=$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
         "$container" 2>/dev/null | awk '{print $1}')

    if [[ -z "$ip" ]]; then
        warn "Could not determine IP for '$service' — skipping HTTP check"
        return
    fi

    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
                --max-time 10 "http://${ip}:${port}${path}" || echo "000")

    if [[ "$http_code" =~ ^(200|301|302|304)$ ]]; then
        ok "$label — HTTP $http_code"
    else
        warn "$label — HTTP $http_code (may still be starting up)"
    fi
}

[[ "$MODE" == "standalone" ]] && wait_for_container nginx
wait_for_container frontend
wait_for_container jobs-server
wait_for_container adam-service

info "Waiting 5s for services to finish initialising…"
sleep 5

check_http "Frontend"     frontend     80   "/"
check_http "Jobs server"  jobs-server  3001 "/api/fetch-jobs"
check_http "Adam service" adam-service 3002 "/api/fetch-jobs"

# =============================================================================
#  STEP 14 — Patch giron nginx   (giron only)
# =============================================================================
if [[ "$MODE" == "giron" ]]; then
    hdr "STEP 14 — nginx configuration (giron)"

    if [[ -z "$NGINX_CONTAINER" ]]; then
        warn "No nginx container provided — skipping nginx patch."
        warn "Manually add the blocks from nginx-ikea.conf to your nginx config."
    else
        NGINX_CONF=$(docker inspect "$NGINX_CONTAINER" \
            --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/nginx.conf"}}{{.Source}}{{end}}{{end}}' \
            2>/dev/null)

        if [[ -z "$NGINX_CONF" ]]; then
            warn "Could not detect nginx.conf path from container mounts."
            warn "Manually add the blocks from nginx-ikea.conf to your nginx config."
        elif [[ ! -f "$NGINX_CONF" ]]; then
            warn "nginx.conf not found at $NGINX_CONF — skipping"
        else
            info "Found nginx config: $NGINX_CONF"

            if grep -q "ikea-frontend" "$NGINX_CONF"; then
                ok "IKEA blocks already present — skipping patch"
            else
                cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
                ok "Backup saved"

                python3 - "$NGINX_CONF" << 'PYEOF'
import sys, re

path = sys.argv[1]
with open(path) as f:
    content = f.read()

UPSTREAMS = """
    upstream ikea-frontend      { server ikea-frontend:80;        keepalive 16; }
    upstream ikea-jobs-server   { server ikea-jobs-server:3001;   keepalive 16; }
    upstream ikea-adam-service  { server ikea-adam-service:3002;  keepalive 16; }
"""

LOCATIONS = """
        # ─── IKEA Jobs ───────────────────────────────────────────────────
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
            proxy_pass         http://ikea-adam-service/;
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

last_up = [m.end() for m in re.finditer(r'upstream\s+\w+\s*\{[^}]*\}', content)]
if not last_up:
    print("ERROR: no upstream blocks found in nginx.conf", file=sys.stderr); sys.exit(1)
content = content[:last_up[-1]] + "\n" + UPSTREAMS + content[last_up[-1]:]

m = re.search(r'(\n[ \t]+location\s+/\s*\{)', content)
if not m:
    print("ERROR: could not find 'location /' in nginx.conf", file=sys.stderr); sys.exit(1)
content = content[:m.start()] + "\n" + LOCATIONS + content[m.start():]

with open(path, 'w') as f:
    f.write(content)
print("OK")
PYEOF

                ok "nginx.conf patched"

                if docker exec "$NGINX_CONTAINER" nginx -t 2>&1; then
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
fi

# =============================================================================
#  STEP 15 — Seed test job data
# =============================================================================
hdr "STEP 15 — Test job data"

echo -e "${CYAN}  If ADAM credentials are not yet available, you can seed fake jobs${NC}"
echo "  so the site shows something. This can be done now or skipped."
echo
ask "Inject test job data? [y/N]:"
read -r SEED_DATA
if [[ "${SEED_DATA,,}" == "y" ]]; then
    ask "How many test jobs to generate? [15]:"
    read -r _input; SEED_COUNT="${_input:-15}"
    info "Generating $SEED_COUNT test jobs…"
    "${COMPOSE[@]}" exec -T adam-service node seed-jobs.js "$SEED_COUNT"
    ok "$SEED_COUNT test jobs injected"
else
    info "Skipped — live jobs will be fetched from ADAM"
fi

# =============================================================================
#  Summary
# =============================================================================
hdr "Installation complete"

echo -e "${BOLD}Running containers:${NC}"
"${COMPOSE[@]}" ps

echo
ok "IKEA Jobs is up and running."
echo

if [[ "$MODE" == "standalone" ]]; then
    echo -e "${BOLD}  App URL:      ${GREEN}https://${DOMAIN}/ikea${NC}"
else
    echo -e "${BOLD}  App URL:      ${GREEN}https://yourdomain.com/ikea${NC}"
fi

echo -e "${BOLD}  Logs:         ${CYAN}cd ${INSTALL_DIR} && docker compose logs -f${NC}"
echo -e "${BOLD}  Stop:         ${CYAN}cd ${INSTALL_DIR} && docker compose down${NC}"
echo -e "${BOLD}  Update:       ${CYAN}cd ${INSTALL_DIR} && git pull && docker compose up -d --build${NC}"
echo -e "${BOLD}  Seed jobs:    ${CYAN}cd ${INSTALL_DIR} && docker compose exec adam-service node seed-jobs.js 15${NC}"
echo

if [[ "$ADAM_API_TOKEN" == "PENDING" ]]; then
    warn "ADAM token was left as PENDING."
    warn "Edit ${INSTALL_DIR}/.env and set ADAM_API_TOKEN, then run:"
    warn "  docker compose up --force-recreate -d jobs-server adam-service"
fi
