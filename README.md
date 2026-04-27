# IKEA Jobs Portal

An internal web portal for IKEA Israel that displays open positions (pulled from the ADAM HR system) and lets candidates submit applications with a CV file.

---

## Table of contents

- [Architecture](#architecture)
- [Before you begin](#before-you-begin)
  - [1. Domain name](#1-domain-name)
  - [2. Gmail SMTP setup](#2-gmail-smtp-setup)
  - [3. ADAM API credentials](#3-adam-api-credentials)
- [Installation](#installation)
  - [Standalone mode (fresh server)](#standalone-mode-fresh-server)
  - [Giron mode (existing nginx)](#giron-mode-existing-nginx)
- [Post-installation management](#post-installation-management)
- [Updating](#updating)
- [Configuration reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
Internet
   │  HTTPS
   ▼
┌─────────────────────────────────────────────────────────┐
│  nginx  (standalone: Docker container with Let's Encrypt)│
│         (giron: existing Giron Security nginx container) │
└──────────┬────────────────┬────────────────────────────-┘
           │ /ikea/         │ /ikea/api/apply/   /ikea/api/jobs/
           ▼                ▼                    ▼
    ┌──────────────┐  ┌─────────────┐   ┌──────────────────┐
    │   frontend   │  │ jobs-server │   │   adam-service   │
    │  React/nginx │  │  Node.js    │   │   Node.js        │
    │  port 80     │  │  port 3001  │   │   port 3002      │
    └──────────────┘  └──────┬──────┘   └────────┬─────────┘
                             │                    │
                        ┌────┴────┐         ┌─────┴──────┐
                        │  ADAM   │         │   ADAM     │
                        │  (POST  │         │   (GET     │
                        │  apply) │         │   jobs)    │
                        └─────────┘         └────────────┘
                             │
                        ┌────┴────┐
                        │  Gmail  │
                        │  SMTP   │
                        └─────────┘
```

### Services

| Container | Port | Responsibility |
|---|---|---|
| `ikea-frontend` | 80 (internal) | React app built at deploy time, served by nginx |
| `ikea-jobs-server` | 3001 (internal) | Access gate, application submissions → ADAM + Gmail |
| `ikea-adam-service` | 3002 (internal) | Job listings from ADAM HR API with local JSON cache |
| `ikea-nginx` | 80, 443 | SSL termination + reverse proxy (standalone mode only) |

---

## Before you begin

Gather these four things before running the install script.

### 1. Domain name

You need a domain (or subdomain) that points to your server's IP address.

Example: `jobs.mycompany.com` → `1.2.3.4`

The app is served at `https://yourdomain.com/ikea`.

The domain is required in **standalone mode** for Let's Encrypt SSL. In **giron mode**, your existing nginx already handles the domain and SSL.

### 2. Gmail SMTP setup

The system sends two emails on each application: a confirmation to the candidate and a notification (with CV attached) to the recruiter.

**Step-by-step:**

1. Use or create a Gmail account dedicated to sending (e.g. `ikea.mailer@gmail.com`)
2. Go to **Google Account → Security**
3. Enable **2-Step Verification** (required for App Passwords)
4. Go to **Google Account → Security → App passwords**
5. Select app: **Mail**, device: **Other** → name it "IKEA Jobs"
6. Google generates a **16-character password** (e.g. `abcd efgh ijkl mnop`)
7. Copy it — you will enter it during installation as the Gmail App Password

> Use the 16-character App Password, not your regular Gmail login password.

### 3. ADAM API credentials

Provided by IKEA IT:

| Item | Example |
|---|---|
| Base URL | `https://services.adamtotal.co.il/api/` |
| Token | `45563CBE-BA8F-4960-8198-0D4C334DD29C` |

If you don't have them yet, press Enter during installation to leave them as `PENDING` and use seed (test) data in the meantime.

---

## Installation

### Requirements

- Linux server: **Ubuntu 20+**, **Debian 11+**, **Fedora 38+**, or **RHEL / AlmaLinux / Rocky 8+**
- Root access (`sudo`)
- Ports 80 and 443 open (standalone mode)
- Domain pointing to the server (standalone mode)

Docker and all other dependencies are installed automatically by the script.

### One-command install

```bash
curl -fsSL https://raw.githubusercontent.com/yaakovsc/ikeaj/main/install.sh -o install.sh
sudo bash install.sh
```

Or if you have already cloned the repo:

```bash
sudo bash /opt/ikea-jobs/install.sh
```

The script is interactive — it will ask you questions and install everything.

---

### Standalone mode (fresh server)

Use this when the server has no existing nginx.

**What the script does:**

| Step | Action |
|---|---|
| 0 | Verify running as root |
| 1 | Detect OS (Ubuntu / Debian / Fedora / RHEL) |
| 2 | You select **standalone** |
| 3 | Collect configuration (domain, email, ADAM) |
| 4 | Install system packages (`curl`, `git`, `python3`) |
| 5 | Install Docker Engine + Compose plugin |
| 6 | Open firewall ports 80, 443, 587 (outbound SMTP) |
| 7 | Clone repo to `/opt/ikea-jobs` |
| 8 | Write `.env` with all credentials |
| 9 | Obtain SSL certificate via Let's Encrypt (certbot standalone) |
| 10 | Generate `nginx-ikea-standalone.conf` with your domain |
| 11 | *(network is defined inside compose — no action)* |
| 12 | Build Docker images and start all containers |
| 13 | Health checks on all services |
| 14 | *(nginx patch skipped — nginx is inside compose)* |
| 15 | Optionally seed fake job data for testing |

**After installation, the app is live at `https://yourdomain.com/ikea`.**

SSL certificates are renewed automatically every 12 hours by the `certbot` container.

---

### Giron mode (existing nginx)

Use this when a Giron Security (or any other) nginx Docker container is already running on the server and handling SSL.

**What the script does:**

Steps 0–8 are the same. Then:

| Step | Action |
|---|---|
| 9–10 | Skipped (no SSL needed — existing nginx has it) |
| 11 | Create the `web` Docker network; connect existing nginx container to it |
| 12 | Build Docker images and start containers |
| 13 | Health checks |
| 14 | Auto-patch existing nginx.conf with IKEA upstream blocks and location blocks |
| 15 | Optionally seed fake job data |

**The script adds these blocks to your existing nginx config:**

```nginx
# Upstreams (inside http { })
upstream ikea-frontend     { server ikea-frontend:80;       keepalive 16; }
upstream ikea-jobs-server  { server ikea-jobs-server:3001;  keepalive 16; }
upstream ikea-adam-service { server ikea-adam-service:3002; keepalive 16; }

# Locations (inside server { }, before location /)
location /ikea/ {
    proxy_pass http://ikea-frontend/;
    ...
}
location /ikea/api/jobs/ {
    proxy_pass http://ikea-adam-service/;
    ...
}
location /ikea/api/apply/ {
    proxy_pass http://ikea-jobs-server/;
    client_max_body_size 6M;
    ...
}
```

See [nginx-ikea.conf](nginx-ikea.conf) for the full block with all headers.

---

## Post-installation management

All commands run from `/opt/ikea-jobs`.

| Task | Command |
|---|---|
| Check container status | `docker compose ps` |
| View all logs | `docker compose logs -f` |
| View one service | `docker compose logs -f jobs-server` |
| Stop everything | `docker compose down` |
| Restart one service | `docker compose restart adam-service` |
| Rebuild after code change | `docker compose up -d --build` |
| Seed test jobs | `docker compose exec adam-service node seed-jobs.js 15` |
| Edit credentials | `nano .env` then `docker compose up --force-recreate -d` |
| Update recruiter email | `sudo sed -i 's/^RECIPIENT_EMAIL=.*/RECIPIENT_EMAIL=new@email.com/' .env` then recreate jobs-server |

> For standalone mode, prefix all compose commands with `-f docker-compose.standalone.yml`.

---

## Updating

```bash
cd /opt/ikea-jobs
git pull
docker compose up -d --build
```

This pulls the latest code and rebuilds only the changed images.

---

## Configuration reference

All configuration lives in a single `.env` file at `/opt/ikea-jobs/.env`.

| Variable | Required | Description |
|---|---|---|
| `RECIPIENT_EMAIL` | Yes | Recruiter's email — receives application notifications |
| `EMAIL_USER` | Yes | Gmail address used to send emails |
| `EMAIL_PASS` | Yes | Gmail App Password (16 characters) |
| `ADAM_API_BASE_URL` | Yes | ADAM API endpoint, e.g. `https://services.adamtotal.co.il/api/` |
| `ADAM_API_TOKEN` | Yes | ADAM API token from IKEA IT |

**Job cache settings** (`/opt/ikea-jobs/ikea-adam-service/config.json`):

```json
{ "refreshMinutes": 30 }
```

Change `refreshMinutes` to control how often job listings are refreshed from ADAM.

---

## Troubleshooting

### "מסד נתונים מקומי — ADAM לא זמין" banner

The app cannot reach the ADAM API and is showing cached jobs.
Check:
```bash
docker compose logs adam-service
```
Common cause: wrong `ADAM_API_TOKEN` or `ADAM_API_BASE_URL` in `.env`.

### Email not arriving

1. Confirm `EMAIL_USER` and `EMAIL_PASS` are correct in `.env`
2. Confirm 2-Step Verification is enabled on the Gmail account
3. Confirm you used an **App Password**, not your regular Gmail password
4. Check logs: `docker compose logs jobs-server`

### SSL certificate issues (standalone)

```bash
certbot certificates          # list certs and expiry dates
certbot renew --dry-run       # test renewal
```

The certbot container inside Docker renews automatically. If the cert is expired:
```bash
docker compose -f docker-compose.standalone.yml exec certbot certbot renew
```

### Container won't start

```bash
docker compose ps             # check status
docker compose logs <service> # check error output
```

### Port 80 already in use (during certbot)

Something else is using port 80 on the host. Find and stop it:
```bash
ss -tlnp | grep :80
```

---

## File structure

```
ikea-jobs/
├── install.sh                      # Installation script (all modes, all OS)
├── docker-compose.yml              # Giron mode compose
├── docker-compose.standalone.yml   # Standalone mode compose (nginx + certbot)
├── nginx-ikea.conf                 # nginx snippet for giron mode
├── nginx-ikea-standalone.conf      # Full nginx config (generated at install time)
├── .env                            # All credentials (not in git)
├── .env.example                    # Template showing required variables
├── INSTALL.md                      # Quick-start installation guide
├── CHANGES.md                      # Change log
├── ikea-jobs-page/                 # React frontend
├── ikea-jobs-server/               # Application server (Node.js/Express)
└── ikea-adam-service/              # ADAM API proxy + job cache (Node.js/Express)
```
