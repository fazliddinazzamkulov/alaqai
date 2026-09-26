# alaqai

A platform for teachers in Kazakhstan: type a topic and alaqai prepares the whole
lesson — lesson plan (KSP), slides, games, a test and homework — plus a full
in-lesson workspace (own PDF/DOCX/PPTX reader, whiteboard, timer, class journal,
AI assistant). The landing page lives at [alaqai.online](https://www.alaqai.online)
in Kazakh, Russian and English.

## Pages (static, served by GitHub Pages)

| File | What it is |
|---|---|
| `index.html` | Landing page in қазақша / русский / English (switcher in the header, choice saved in `localStorage` as `alaqai_lang`; `?lang=kk\|ru\|en` links work too) |
| `platform.html` | Dashboard: manage classes, launch tools to prepare lessons in advance |
| `lesson.html` | The in-class workspace (formerly `lesson12.html`) — own PDF/DOCX-capable viewer, whiteboard, timer, groups, journal, AI assistant, and embeds the presentation/test generators in an in-lesson overlay |
| `presentation.html` | AI presentation generator — usable standalone (lesson prep) or embedded from `lesson.html` |
| `tests.html` | Test/game constructor (9 formats) — same standalone-or-embedded model, plus an "AI: fill from topic" helper |
| `admin.html` | Owner/admin-only: API key vault, user subscriptions & roles, security (audit log, active sessions) |
| `assets/js/api.js` | Shared client: backend fetch wrapper + Google Identity Services helper, loaded by every page |
| `assets/css/alaqai.css` | Design tokens (colors, fonts) and base styles: logo, black/white buttons, language switcher |
| `assets/js/lang.js` | Interface language (kk / ru / en): `?lang=` → saved choice → browser language → ru |
| `assets/js/landing-i18n.js` | Landing texts in three languages; `index.html` elements point into it with `data-t="key"` |

## Why there's a `server/` folder

GitHub Pages only serves static files — it can't run Node, hold secrets, or
keep a database. So none of the API keys (Gemini ×3 for fallback, a dedicated
Gemini image key for "nano banana", Pixabay, Pexels, Unsplash) live in this
repo or in any browser anymore. They're entered once by an admin in
`admin.html`, stored encrypted in `server/`'s database, and every AI/image
call from the frontend is proxied through that backend. See
[`server/README.md`](server/README.md) for how to run and deploy it, and for
the full API surface.

Once the backend is deployed somewhere (a small VPS, Render, Railway, Fly.io…),
point every page at it by setting `window.ALAQAI_API_BASE` and
`window.ALAQAI_GOOGLE_CLIENT_ID` — each HTML file has a small inline
`<script>` near the top of `<head>` for exactly this:

```html
<script>
  window.ALAQAI_API_BASE = "https://api.alaqai.online";
  window.ALAQAI_GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com";
</script>
```

(Update the placeholder in every page, or replace it once via a find/replace
across the repo before deploying.)

## Google Sign-In

A Google sign-in button is present everywhere (nav bars, the class screen in
`lesson.html`, the compose screens in the tools) but is never required just to
browse the platform or look at the tools. It's required only for anything
that calls the AI backend (generating a presentation/test, the in-lesson AI
assistant, AI images) and for anything that should persist to an account
(classes, saved presentations/tests). Set this up in Google Cloud Console →
APIs & Services → Credentials → OAuth Client ID (Web application), add every
origin this site is served from under "Authorized JavaScript origins", and
use that Client ID both in the frontend snippet above and as `GOOGLE_CLIENT_ID`
in the backend's `.env`.

## Roles & subscriptions

- `teacher` (default): everything except `/admin.html`. New Google sign-ins
  get a free trial (`TRIAL_DAYS` in the backend, default 7 days) before AI
  features require an `active` subscription set by an admin.
- `admin`: can manage the API key vault and teacher subscriptions from
  `admin.html`.
- `owner` (company leadership): everything an admin can do, plus the
  Security tab (audit log, active sessions / force-logout) and the only role
  that can promote/demote admins. Bootstrap your own account into this role
  by listing your email in the backend's `OWNER_EMAILS` before your first
  Google sign-in.

## What changed from the original mockups

- `lesson12.html`'s hardcoded Gemini key is gone; all AI calls now go through
  `/api/ai/generate` with the server picking a key/model.
- The PDF viewer used to be an `<iframe>` pointed at a blob URL, which just
  hands the file to the browser's own PDF plugin. It's now rendered with
  pdf.js directly inside the page (same approach as the standalone
  `viewer_1.html` prototype), so it's the platform's own reader everywhere.
- The presentation generator's "Settings" modal used to ask teachers to paste
  their own Gemini/Pexels/Unsplash/Pixabay keys into the browser. That's
  removed — those keys now live only in the admin-managed backend vault.
- The presentation generator's history used `window.storage`, an API that
  doesn't exist in a real browser (decks silently failed to persist). History
  now saves to the backend content library when signed in, with a
  localStorage fallback for anonymous/demo use.
