# ikea-jobs-page

React frontend for the IKEA Israel internal jobs portal.

## Tech stack

- React 19 + TypeScript
- Material UI (MUI)
- react-hook-form + Zod
- DOMPurify (XSS protection)

## Environment variables (build-time)

| Variable | Description |
|---|---|
| `REACT_APP_JOBS_SERVER_URL` | Base URL for application submissions |
| `REACT_APP_ADAM_SERVICE_URL` | Base URL for job listings |
| `PUBLIC_URL` | Sub-path prefix (e.g. `/ikea`) |

In development these default to `http://localhost:3001` / `http://localhost:3002`.

## Development

```bash
npm install
npm start   # http://localhost:3000
```

## Production build

```bash
npm run build
```

Built by Docker as part of `docker compose up --build`.

## Structure

```
src/
├── components/
│   ├── JobsList/           # Job grid with filters and search
│   ├── JobItem/            # Single job card (expand / apply)
│   └── ApplicationForm/    # CV upload + submission form
├── services/
│   └── applicationService.ts   # Sends application to jobs-server
└── types/
    └── index.ts
```
