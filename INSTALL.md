# IKEA Jobs — Installation Guide

Target environment: **Ubuntu 24 LTS** with an existing containerised nginx (80→443).  
The app runs at `https://yourdomain.com/ikea`.

---

## Prerequisites

- Ubuntu 24 server with root access
- An existing nginx Docker container handling SSL (ports 80/443)
- ADAM API base URL and token (provided by IKEA IT)

The install script will automatically install **Docker** and **Docker Compose** if they are not already present.

---

## Installation

### Step 1 — Download the install script

```bash
curl -fsSL https://raw.githubusercontent.com/yaakovsc/ikeaj/main/install.sh -o install.sh
```

### Step 2 — Run as root

```bash
sudo bash install.sh
```

### Step 3 — Answer the prompts

Press **Enter** to accept the default shown in brackets, or type a new value.

| Prompt | Default | Notes |
|---|---|---|
| Recruiter email | `yaakovsc@gmail.com` | Applications are forwarded here |
| Gmail sender address | `mailermechanism@gmail.com` | Account that sends the emails |
| Gmail App Password | `tcrdwckwlhalurlz` | Gmail app password (not login password) |
| ADAM API base URL | *(none — must enter)* | e.g. `https://adam.example.com/api/` |
| ADAM API token | *(none — must enter)* | Provided by IKEA IT |
| Existing nginx container name | *(none)* | e.g. `nginx-proxy` — press Enter to skip |

### Step 4 — Configure your existing nginx

The script prints three `location` blocks at the end. Add them inside the `server {}` block of your existing nginx site config:

```nginx
location /ikea/ {
    proxy_pass         http://frontend:80/;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}

location /ikea/api/jobs/ {
    proxy_pass         http://email-service:3002/;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-Proto $scheme;
}

location /ikea/api/apply/ {
    proxy_pass         http://jobs-server:3001/;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-Proto $scheme;
    client_max_body_size 6M;
}
```

Then reload nginx:

```bash
docker exec <your-nginx-container> nginx -s reload
```

### Step 5 — Final prompts

```
? Reload nginx now? [y/N]       →  y  (once you have added the location blocks)
? Inject test job data? [y/N]   →  y  if ADAM is not yet connected
? How many test jobs? [15]      →  Enter
```

---

## What the script does

| Step | Action |
|---|---|
| 0 | Verifies running as root |
| 1 | Collects all credentials and config |
| 2 | Installs Docker + Docker Compose if missing |
| 3 | Clones the repository to `/opt/ikea-jobs` (or `git pull` if already present) |
| 4 | Writes `.env` files for both backend services |
| 5 | Creates the `web` Docker network and connects the existing nginx container |
| 6 | Builds all Docker images and starts the containers |
| 7 | Runs health checks on all three services |
| 8 | Prints nginx location blocks and optionally reloads nginx |
| 9 | Optionally seeds the local job database with test data |

---

## After installation

| Task | Command |
|---|---|
| Check container status | `cd /opt/ikea-jobs && docker compose ps` |
| View logs | `cd /opt/ikea-jobs && docker compose logs -f` |
| Stop the app | `cd /opt/ikea-jobs && docker compose down` |
| Update to latest version | `cd /opt/ikea-jobs && git pull && docker compose up -d --build` |
| Re-seed test jobs | `cd /opt/ikea-jobs && docker compose exec email-service node seed-jobs.js 15` |

---

## Indicators in the UI

If the ADAM API is unreachable, the app falls back to the locally cached job list and displays a yellow warning banner at the top of the page:

> ⚠️ מסד נתונים מקומי — ADAM לא זמין. המשרות המוצגות עשויות לא לשקף את המצב הנוכחי.

The banner disappears automatically once ADAM connectivity is restored.
