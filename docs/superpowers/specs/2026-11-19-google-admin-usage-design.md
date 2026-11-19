# Google-only sign-in, admins by e-mail, usage control — design

Short design (small project). Fazliddin asked: remove SMS, sign in only with
Google (teachers and admins), he chooses which Google accounts are admins,
the admin sees who spent how much and how many requests went to each service
(Gemini, Nano Banana, Pexels, Pixabay), can give a teacher extra limit or
restrict them. He cannot do anything on GitHub himself — Claude merges and
pushes; only server commands stay with him.

## Goals
- Sign-in: Google only. SMS routes, SMS service, Mobizon key and OWNER_PHONES removed.
- Owner: OWNER_EMAILS in the server `.env`; `deploy/setup.sh` asks for it.
- Admins: the owner adds Google e-mails in «Администраторы» (works before the
  person ever signed in). Removing an e-mail makes them a teacher again.
- Service usage: every Gemini / Gemini Image / Pexels / Pixabay / Unsplash call is
  logged with its service. Admin sees today / 7 days / 30 days and failures per
  service and sets a daily limit per service (empty = none). A service at its
  limit refuses for the rest of the day (Kazakhstan time); photo search skips to
  the next service.
- Teacher usage: admin sees every teacher's AI requests (text + images) today /
  week / month and their weekly limit; can add extra requests per week or set a
  personal daily cap (0 = AI switched off for that teacher).

## Non-goals
- Real remaining quota from Google (no API gives it for a key) — we count our own calls.
- Money per request.

## Approaches
1. **Chosen:** extend the existing admin panel (legacy/app-v1 admin, already
   deployed at /admin) with a «Расход» page and an e-mail list on «Администраторы».
2. Rewrite the admin panel in the v2 design — a day of work, not needed for control.
3. Limits only in `.env` — the owner would have to edit the server for each change.

## Left to the builder
Exact layout of the usage page, wording, bar colours (tokens of the admin CSS).
Existing phone-only accounts can no longer sign in (owner can see them in the
database); accepted — the platform has not launched v2 yet.
