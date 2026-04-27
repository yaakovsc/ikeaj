# ikea-adam-service

ADAM HR API proxy with local JSON cache. Serves job listings to the frontend.

## What it does

- Fetches open positions from the ADAM HR API (`Career/GetOrdersDetails`)
- Caches results locally as JSON to reduce API calls and handle outages
- Exposes a single endpoint: `GET /api/fetch-jobs`

## Cache behaviour

| State | Action |
|---|---|
| No local cache | Fetches from ADAM, saves result |
| Cache fresh (within `refreshMinutes`) | Returns local data, `source: "live"` |
| Cache stale | Refreshes from ADAM; on failure returns stale data, `source: "cache"` |

`refreshMinutes` is configured in `config.json` (default: 30).

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default: 3002) |
| `ADAM_API_BASE_URL` | e.g. `https://services.adamtotal.co.il/api/` |
| `ADAM_API_TOKEN` | Token provided by IKEA IT |

## File structure

```
ikea-adam-service/
├── index.js                        # Express server
├── routes.js                       # GET /api/fetch-jobs
├── config.json                     # { "refreshMinutes": 30 }
├── last_fetch.txt                  # Timestamp of last successful ADAM fetch
├── seed-jobs.js                    # Dev utility — generate test job data
├── package.json
└── src/
    ├── assets/
    │   └── adam_all_orders_json.json   # Local cache
    └── services/
        └── adamService.js              # ADAM API client + cache logic
```

## Seed test data

When ADAM is not yet connected:

```bash
node seed-jobs.js [N]   # default: 15 jobs
```

Or inside the running container:

```bash
docker compose exec adam-service node seed-jobs.js 15
```
