# CHANGES

This file tracks bug-fix changes made in this repository.
It should be updated whenever a new bug fix is applied.

## 2026-04-27

### Removed access gate (token + reCAPTCHA)
- Deleted `ikea-jobs-page/src/components/AccessGate/AccessGate.tsx`
- Deleted `ikea-jobs-server/src/routes/accessRoutes.js`
- `App.tsx`: removed `<AccessGate>` wrapper — app renders directly
- `ikea-jobs-server/index.js`: removed `accessRoutes` import and registration
- `ikea-jobs-server/package.json`: removed `express-rate-limit` dependency
- `ikea-jobs-page/package.json`: removed `react-google-recaptcha` and `@types/react-google-recaptcha`
- `ikea-jobs-page/Dockerfile`: removed `REACT_APP_RECAPTCHA_SITE_KEY` build arg
- `docker-compose.yml`, `docker-compose.standalone.yml`: removed `REACT_APP_RECAPTCHA_SITE_KEY` build arg
- `.env.example`: removed `ACCESS_TOKEN`, `RECAPTCHA_SECRET_KEY`, `REACT_APP_RECAPTCHA_SITE_KEY`
- `install.sh`: removed access token and reCAPTCHA prompts; removed from `.env` template
- `README.md`, `ikea-jobs-page/README.md`: removed all access gate and reCAPTCHA references

### Standalone deployment mode + multi-distro install
- Added `docker-compose.standalone.yml`: includes nginx (SSL termination) and certbot (auto-renewal) containers; network is internal (not external)
- `install.sh` rewritten to support Ubuntu, Debian, Fedora, RHEL/AlmaLinux/Rocky
- `install.sh` now prompts for deployment mode: standalone (fresh server) vs giron (existing nginx)
- Standalone flow: certbot obtains Let's Encrypt cert before starting containers; generates `nginx-ikea-standalone.conf` with domain substituted
- Firewall support: ufw (Debian/Ubuntu) and firewalld (Fedora/RHEL); opens 80, 443, 587
- Docker install now covers apt (Ubuntu/Debian) and dnf (Fedora/RHEL) package managers
- Install now prompts for `ACCESS_TOKEN` and reCAPTCHA keys (previously missing from script)
- Single root `.env` is now written by the install script (replaces two separate service `.env` files)
- `README.md` completely rewritten: architecture diagram, all prerequisites, Gmail SMTP setup guide, both installation modes, management commands, troubleshooting

### Renamed email-service → adam-service
- Directory renamed: `ikea-email-service` → `ikea-adam-service`
- Docker service: `email-service` → `adam-service`, container: `ikea-email-service` → `ikea-adam-service`
- Removed dead code: `src/controllers/applicationController.js`, `src/services/emailService.js` (old email flow replaced by jobs-server long ago)
- Removed unused `multer` and `nodemailer` dependencies from `package.json`
- Simplified `routes.js` to only the active route: `GET /api/fetch-jobs`
- Simplified `index.js`: removed multer error handler (no longer relevant)
- Renamed build arg and env var: `REACT_APP_EMAIL_SERVICE_URL` → `REACT_APP_ADAM_SERVICE_URL`
- Updated: `docker-compose.yml`, `nginx-ikea.conf`, `INSTALL.md`, `install.sh`, `ikea-jobs-page/Dockerfile`, `useJobsList.ts`, `.env.example`, `README.md`

## 2026-04-23

### Server startup fix
- Added `ikea-jobs-server/src/index.js` as a compatibility entrypoint.
- This fixes `MODULE_NOT_FOUND` when running `node src/index.js` from `ikea-jobs-server`.
- The file forwards execution to the real entrypoint: `ikea-jobs-server/index.js`.

### Frontend runtime crash fix (Jobs list)
- Fixed crash: `Cannot read properties of undefined (reading 'name_snif')`.
- Updated `ikea-jobs-page/src/components/JobsList/useJobsList.ts`:
  - Added robust response normalization (`array`, `jobs`, or `data` payload shapes).
  - Filtered invalid/non-object records before storing jobs.
  - Returned an empty array on fetch failure instead of propagating invalid data.
  - Stabilized `fetchJobs` with `useCallback` and updated `useEffect` dependency.
- Updated `ikea-jobs-page/src/components/JobsList/utils.ts`:
  - Added defensive guard in `filterJobs` for invalid job entries.
  - Hardened `getUniqueBranches` and `getUniqueProfessions` to safely ignore bad/empty values.

### Validation
- Frontend build succeeds after these fixes.
- `useJobsList` warnings were resolved.
- One unrelated warning remains in `ikea-jobs-page/src/components/ApplicationForm/useApplicationForm.ts` (`sendJobApplicationEmail` unused).

### ActiveTrail credentials configured
- Updated `ikea-jobs-server/.env`: `RECIPIENT_EMAIL` set to `yaakovsc@gmail.com`.
- Updated `ikea-jobs-server/.env`: `ACTIVE_TRAIL_TOKEN` set to real production token.
- Updated `ikea-jobs-server/.env`: `USER_PROFILE_ID` set to `32111` (correct Sender Profile ID — verified working via API test).
- Server restarted on port 3001 to apply all changes.

### Success message — subtle green tint (2026-04-24)
- Background changed to `#f0faf4`, border to `#2e7d32`, heading color to `#1b5e20`.

### Filter dropdown — removed panel border (2026-04-24)
- Removed `border: 1.5px solid #000` from the open dropdown panel. Now uses box-shadow only for depth.

### Font size increase — improved readability (2026-04-24)
- Base html font: 16px → 18px (mobile: 16px, tablet: 17px, large: 20px).
- All component-level px sizes scaled ~15–20%: 13→15, 14→16, 15→17, 16→18, 17→20, 20→23, 22→26, 32→38px.
- Affects: JobTitle, MetaRow, ExpandButton, JobDescription, FilterLabel, SearchButton, ResultsCount, PageTitle, IkeaLogo, HeaderSearch, FilterDropdown, FormTitle, StyledInput, FileLabel, SubmitButton, SuccessMessage.

### Filter dropdown — removed focus outline (2026-04-24)
- Added `.filter-trigger` class to dropdown trigger buttons and added `.filter-trigger:focus-visible { outline: none }` to `index.css` to override the global `:focus-visible` yellow outline rule.

### Filter dropdown — fully borderless trigger (2026-04-24)
- Removed remaining bottom-line border and focus outline from filter dropdown trigger buttons (חנות, תחום מקצועי). Triggers now appear as plain text with arrow only.

### UI polish & email redesign (2026-04-24)
- **Rounded buttons**: all buttons site-wide now use `borderRadius: 20–24px` — ExpandButton, SearchButton, "בחר הכל"/"הסר הכל" inside dropdowns, SubmitButton in form.
- **Filter dropdowns**: removed visible border from trigger button; replaced with subtle bottom-line (`1.5px solid #ccc`) that darkens to black on hover.
- **"לפרטים והגשה" placement**: moved next to social icon buttons (flex row, `gap: 6px`) instead of opposite side.
- **Professional IKEA HTML emails**: rewrote both candidate and recruiter emails as responsive HTML tables with IKEA header (blue `#0058a3` + yellow `#FFDA1A`), structured info tables, clickable phone/email links, and branded footer.
- **Minimal success message**: replaced green/yellow alert box with a clean white panel with black right-border, dark heading, and muted body text.

### Full UI redesign — IKEA design language (2026-04-24)
- Complete redesign of the jobs page to match IKEA Scandinavian minimalism (black/white, flat, generous whitespace, RTL).
- **Header**: sticky two-tier header — black top ribbon (40px) + main row with IKEA logo and search input ("מה לחפש לך?").
- **Banner**: full-width `banner.avif` hero image (add file to `public/` folder; graceful fallback if missing).
- **Layout**: RTL sidebar (filters, 280px) + jobs 2-column grid. Collapses to single column on mobile.
- **Multi-select filters**: replaced single-select dropdowns with custom animated `FilterDropdown` component with "בחר הכל" / "הסר הכל" and checkbox list.
- **Active filter chips**: selected filters shown as dismissible chips above the job grid.
- **Loading skeleton**: shimmer animation cards while jobs are fetching.
- **Live filtering**: `filteredJobs` is now a `useMemo` — results update automatically on every keystroke or selection without clicking "חיפוש".
- **Job cards**: redesigned as clean bordered cards in a 2-column grid; social sharing moved to icon-only buttons (WhatsApp/Facebook); expand toggle button with animated arrow.
- **`useJobsList`**: `selectedBranch/selectedProf` (string) replaced with `selectedBranches/selectedProfs` (string[]) for multi-select; added `isLoading` state.
- **`filterJobs`** in utils.ts: updated signature to accept `string[]` for branch/profession arrays.
- **`constants.ts`**: updated labels — page title → "חיפוש משרות", search placeholder → "מה לחפש לך?", added `FILTER_TITLE`, `STORE_FILTER`, `DOMAIN_FILTER`, `LOADING`.
- **`App.tsx`**: stripped down to a single `<JobsList />` render.
- New file: `FilterDropdown.tsx`.

### Make.com webhook + CV file forwarding (2026-04-24)
- Added Make.com webhook call on every application submission.
- Webhook URL: `https://hook.eu2.make.com/rbqabet6myrf6flc9dtw5cz29jtfmu5b`
- Payload sent as `multipart/form-data` with fields: `fullName`, `email`, `phone`, `jobTitle`, `jobId`, `jobBranch`, `jobDomain`, and `cvFile` (if uploaded).
- Added `multer` and `form-data` dependencies to `ikea-jobs-server`.
- Updated `ikea-jobs-server/src/routes/applicationRoutes.js`: added multer middleware to accept `cvFile` uploads (PDF/DOC/DOCX, max 5MB).
- Updated `ikea-jobs-server/src/controllers/applicationController.js`: webhook call runs in parallel with ActiveTrail emails; parses `job` field from JSON string.
- Updated `ikea-jobs-page/src/services/activeTrailService.ts`: frontend now sends `FormData` (instead of JSON) including the CV file.

### Split full name into first name + last name (2026-04-26)
- ApplicationForm now has two separate fields: שם פרטי and שם משפחה.
- Updated schema.ts, storage.ts, useApplicationForm.ts, applicationService.ts, applicationController.js.
- Server composes fullName = firstName + lastName for email display.
- localStorage auto-fill updated to save/restore firstName and lastName separately.

### Access gate token screen (2026-04-26)
- Added full-screen overlay on page load requiring a token to enter.
- Shows "קובי שלזינגר תוכנה" branding and a password input (asterisks only).
- Wrong token shows error and clears the field. Correct token grants access for the session (sessionStorage).

### Free text search covers all card fields (2026-04-26)
- Search now matches across all visible card fields: job title, branch, profession, living areas, and profession name.
- Previously only searched job title and `tat_profession_name`.

### Scroll to top on page load (2026-04-26)
- Added `window.scrollTo(0, 0)` on mount in App.tsx so the page always starts at the top on reload.

### Fix Hebrew filename gibberish in recruiter email attachment (2026-04-26)
- multer decodes uploaded filenames as Latin-1 by default, corrupting Hebrew UTF-8 characters.
- Fixed by re-encoding `cvFile.originalname` with `Buffer.from(..., 'latin1').toString('utf8')` before passing to Nodemailer.

### install.sh — open outbound SMTP port 587 in firewall (2026-04-25)
- Added `ufw allow out 587/tcp` in Step 2 so Gmail email delivery works out of the box.

### Switch Gmail SMTP from port 465 to 587 (2026-04-25)
- Changed mailer.js transporter from `service: 'gmail'` to explicit host/port config using port 587 (STARTTLS).
- Port 465 was blocked by the VPS provider; port 587 is open.

### Fix logo and banner images missing at /ikea sub-path (2026-04-25)
- Changed `/ikea-logo.png` and `/banner.avif` src attributes to use `process.env.PUBLIC_URL` prefix.
- Without the prefix, the browser requested `/ikea-logo.png` which missed the nginx `/ikea/` proxy rule and got redirected to `/login`.

### install.sh — automated nginx config patching (2026-04-24)
- Step 8 now auto-patches giron nginx.conf instead of printing manual instructions.
- Detects nginx.conf path from `docker inspect` bind mounts of the provided container.
- Idempotency check: skips if `ikea-frontend` block already present.
- Backs up config before any edit.
- Uses embedded Python3 to insert IKEA upstream blocks after the last upstream block and IKEA location blocks before the first `location /` block.
- Tests config with `nginx -t` inside the container; restores backup on failure.
- Reloads nginx automatically on success.

### install.sh — automated server installation script (2026-04-25)
- Added `install.sh`: full Ubuntu 24 installation from scratch.
- Prompts for all credentials (recruiter email, Gmail, ADAM API).
- Installs Docker + Compose if missing, clones repo, writes .env files.
- Creates Docker network, connects existing nginx container.
- Builds and starts all containers, runs health checks on each service.
- Prints nginx location blocks and optionally reloads nginx.
- Prints summary with management commands.

### Containerization — Docker setup (2026-04-25)
- Added `Dockerfile` for each service: `ikea-jobs-page` (nginx multi-stage), `ikea-jobs-server`, `ikea-email-service`.
- Added `docker-compose.yml` at repo root — one command starts all three services.
- Added `.dockerignore` to all three services (excludes `node_modules`, `.env`, `build`).
- Added `ikea-jobs-page/nginx.conf` for SPA routing (React Router fallback).
- Replaced hardcoded `localhost` URLs with `REACT_APP_JOBS_SERVER_URL` / `REACT_APP_EMAIL_SERVICE_URL` env vars.
- Renamed `activeTrailService.ts` → `applicationService.ts` (name was stale after ActiveTrail removal).
- Updated import in `useApplicationForm.ts` and removed unused `sendJobApplicationEmail` import.

### Removed Make.com webhook (2026-04-24)
- Removed `sendToMakeWebhook` function and its `Promise.all` call from `applicationController.js`.
- Removed unused `form-data` and `node-fetch` imports from the controller.
- Application submissions now only trigger the two Nodemailer emails (candidate + recruiter).

### Email sending replaced: ActiveTrail → Nodemailer (2026-04-24)
- Removed dependency on ActiveTrail API for sending emails.
- Added `ikea-jobs-server/src/services/mailer.js`: Nodemailer transporter using Gmail SMTP (`EMAIL_USER` / `EMAIL_PASS` from `.env`).
  - `sendCandidateEmail(data)` — HTML confirmation email to applicant, no attachment.
  - `sendRecruiterEmail(data, cvFile)` — HTML notification to recruiter with CV file attached (if uploaded).
- Updated `applicationController.js`: replaced `sendActiveTrailEmail` calls with the two new functions.
- HTML email templates (IKEA-branded, RTL Hebrew) preserved from old service.
- `index.js` startup log updated to reflect Nodemailer.

### Applied jobs stamp — localStorage tracking (2026-04-23)
- Applied job IDs are saved to `localStorage` under key `ikea_applied_jobs`.
- `storage.ts`: added `saveAppliedJob`, `getAppliedJobs`, `hasAppliedToJob`.
- `useApplicationForm.ts`: calls `saveAppliedJob(job.order_id)` and `onApplied?.()` on successful submission.
- `ApplicationForm.tsx`: accepts `onApplied?: () => void` prop and forwards to hook.
- `JobItem.tsx`: reads `hasAppliedToJob` on mount; on apply sets `hasApplied` state.
  - Applied cards show an "הוגש / APPLIED" green rotated stamp instead of the expand button.
  - Title click and details panel are disabled for applied jobs.
- `JobItem.styles.ts`: added `AppliedStamp` styled component (green border, rotated −8°).

### ADAM API integration enabled (2026-04-26)
- Added `ADAM_API_BASE_URL` and `ADAM_API_TOKEN` to `ikea-email-service/.env` and `ikea-jobs-server/.env` (not committed — stays on server).
- Enabled live job fetching in `adamGetDataFromApi()` — removed stub `return null`, now calls `Career/GetOrdersDetails`.
- Enabled `AddCandidateWithFiles()` — removed stub, now calls `Candidate/AddCandidateWithFiles`.
- Added `sendToAdam()` in `applicationController.js`: on every application submission, sends candidate details to ADAM in parallel with the emails (uses `node-fetch`, errors are logged but do not block the response).

### Single open job card at a time (2026-04-26)
- Opening a job card now closes any previously open card.
- Lifted `isOpen` state from `JobItem` to `JobsList` (`openJobId` state).
- `JobItem` now receives `isOpen` and `onToggle` as props instead of managing local state.

### Seed script for test job data
- Added `ikea-email-service/seed-jobs.js` — generates N realistic IKEA Israel job postings.
- Usage: `node seed-jobs.js [N]` (default 15).
- Covers 6 branches (נתניה, ראשון לציון, ירושלים, קריות, באר שבע, פתח תקווה) and 8 domains (מכירות, לוגיסטיקה, קופה, עיצוב, מסעדה, ניהול, תחזוקה, HR).
- Writes directly to `ikea-email-service/src/assets/adam_all_orders_json.json` and resets `last_fetch.txt` so the server serves seed data without hitting the ADAM API.
