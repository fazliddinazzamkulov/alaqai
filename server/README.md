# alaqai backend

Node.js/Express API for the alaqai teaching platform. It owns everything the
static frontend (served from GitHub Pages) must never see directly:

- Google sign-in verification + session cookies (JWT)
- The **API key vault** — Gemini (up to 3 keys, auto-rotated on overload),
  a dedicated Gemini image ("nano banana") key, Pixabay, Pexels, Unsplash.
  Keys are AES-256-GCM encrypted at rest and are never sent back to any client,
  including the admin UI (only a masked preview is shown there).
- The AI/image proxy (`/api/ai/*`, `/api/images/*`) that the presentation
  generator, test constructor and in-lesson AI assistant call — no API key ever
  reaches the browser.
- Classes/students persistence, a saved-content library (presentations/tests),
  subscription state, an audit log and active-session control for the owner
  (company-leader) admin view.

## Why a separate server at all

The rest of this repo is a static site meant for GitHub Pages (see the root
`CNAME`). GitHub Pages cannot run Node code, store secrets, or keep a database,
so this `server/` app has to run somewhere else (a small VPS, Render, Railway,
Fly.io, etc.) and the frontend talks to it over HTTPS with
`credentials: 'include'`. Configure the deployed API URL once in
`assets/js/api.js` (`window.ALAQAI_API_BASE`).

## Local setup

```bash
cd server
npm install
cp .env.example .env
# fill in JWT_SECRET, ENCRYPTION_KEY, GOOGLE_CLIENT_ID, OWNER_EMAILS — see comments in .env.example
npm start
```

Generate the two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # ENCRYPTION_KEY
```

The server listens on `PORT` (default `8787`) and stores its SQLite database
at `DB_PATH` (default `./data/alaqai.sqlite`, auto-created). It uses Node's
built-in `node:sqlite` module — no native build step, but it is still marked
experimental upstream; swap in `better-sqlite3` behind the same `src/db.js`
interface if you need long-term production stability.

## Becoming the owner (company leader) account

Put your Google account's email in `OWNER_EMAILS` (comma-separated for more
than one) **before** signing in with it. On first Google sign-in that account
is created with `role = 'owner'`, which unlocks `/admin.html`'s security tab
(audit log, active sessions, promoting/demoting admins). Every other Google
sign-in becomes a plain `teacher` with a `TRIAL_DAYS`-day trial; an `admin` or
`owner` upgrades them from `/admin.html`.

## API surface

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/google` | — | Exchange a Google ID token for a session cookie |
| `GET /api/auth/me` | — | Current user (or `{user:null}`) |
| `POST /api/auth/logout` | session | Revoke the current session |
| `GET/POST/PATCH/DELETE /api/classes...` | session | Classes & students CRUD |
| `GET/POST/PUT/DELETE /api/content...` | session | Saved presentations/tests |
| `POST /api/ai/generate` | session + active subscription | Gemini `generateContent` proxy (server picks key/model) |
| `POST /api/ai/generate-image` | session + active subscription | Gemini image generation ("nano banana") |
| `GET /api/images/search?q=` | session + active subscription | Pexels → Unsplash → Pixabay fallback chain |
| `GET/POST/PATCH/DELETE /api/admin/keys...` | admin/owner | API key vault |
| `GET/PATCH /api/admin/users...` | admin/owner (role changes: owner only) | Subscriptions, roles, disable |
| `GET /api/admin/audit-log` | owner only | Full audit trail |
| `GET/DELETE /api/admin/sessions...` | owner only | Active sessions / force logout |

## Security notes

- Sessions are httpOnly, signed JWTs whose `jti` is checked against a `sessions`
  row on every request, so `DELETE /api/admin/sessions/:id` immediately kills
  a live session anywhere (used for "someone's laptop was stolen" style response).
- Promoting a user to `admin`/`owner`, or editing an existing admin/owner, is
  restricted to `owner` accounts only — an `admin` cannot escalate themselves
  or another admin.
- Every admin mutation (key changes, subscription/role changes, session
  revocation) is written to `audit_log`, readable only by `owner`.
