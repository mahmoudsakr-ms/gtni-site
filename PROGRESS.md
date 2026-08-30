# PROGRESS.md — GTNI Website

Running chronological log of work done on this project. Newest entry on top.

---

## 2026-08-30 — Phase 1 implemented: security hardening

**Status**: ✅ Phase 1 of `PLAN_SECURITY_I18N.md` complete, verified, committed (`15f1868`). Not yet pushed — pending user confirmation.

- Removed the `force-reset-pd` backdoor from `src/collections/Users.ts` entirely; declared `maxLoginAttempts`/`lockTime` explicitly (unchanged values, just now visible in code).
- `src/globals/Settings.ts`: read/update now require an authenticated user; `smtpPass`/`resendApiKey` fields made write-only (`access.read: () => false`) so they're never returned via API even to logged-in users.
- `src/collections/Media.ts`: `create`/`update`/`delete` now require an authenticated user (read stays public). Dropped the `image/*` wildcard from `mimeTypes` (was allowing unsanitized SVG uploads — stored XSS risk) in favor of an explicit list (jpeg/png/webp/gif + existing video types).
- `src/collections/MediaCategory.ts`, `NewsCategory.ts`: same write-lockdown pattern, read stays public.
- `src/collections/NewsEvents.ts`: same write-lockdown; additionally, anonymous reads are now filtered to `_status: published` only (authenticated users still see drafts, so the admin UI is unaffected).
- `src/app/api/revalidate/route.ts`: now requires a `token` query param or `x-revalidate-token` header matching `CACHE_REVALIDATION_TOKEN` (previously had zero auth check in code). Generated and set a real token value in local `.env`.
- `src/app/api/custom-news-events/route.ts`: caps the `search` query param at 200 chars.
- `next.config.mjs`: added baseline security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS, Permissions-Policy) site-wide. Full CSP intentionally deferred — needs dedicated testing against the Payload admin panel to avoid locking out admin access.
- `src/payload.config.ts`: explicit `cors`/`csrf` scoped to `NEXT_PUBLIC_SERVER_URL` instead of relying on Payload defaults.
- `src/migrations/index.ts`: fixed a pre-existing bug (unrelated to this session's audit but found during it) — `20260811_170000_remove_settings_global` was imported but never added to the exported `migrations` array, so it silently never ran. Now registered. Note for whenever this migration chain is eventually run against production: this migration does `DROP TABLE IF EXISTS settings` — safe/idempotent, but if production's `settings` table still holds old data from before that global was orphaned, that data will be lost when this finally runs. Back up first.

**Verified**: `pnpm run lint` clean. Live-tested every fix against the dev server with curl (anonymous writes to Media/NewsEvents now 403, `force-reset-pd` now 404, `/api/revalidate` now 401 without token / 200 with it, anonymous reads and authenticated writes/login still work correctly). All 9 frontend routes still return 200. No new issues introduced (self-reviewed the full diff).

**Next**: Phase 2 (CMS localization data model) is next — bigger and touches all 10 content globals plus requires a hand-written SQLite migration for production. Push of this Phase 1 commit and continuation policy for the rest still need user confirmation.

---

## 2026-08-29 — Security audit + full security/localization/AI-translation plan approved (not yet implemented)

**Status**: 📋 Planning complete and approved by user; implementation not started (user had to stop for the day).

- Removed the `force-reset-pd` backdoor endpoint findings triggered a deeper ask: "harden the entire project security" + add CMS-managed translation + Google Gemini AI auto-translation with a language switcher on the public site.
- Ran a full security audit (via subagent) covering access control on every collection/global, file upload handling, custom API routes, secrets hygiene, and auth brute-force protection. Found several **critical** issues beyond the original backdoor:
  - `src/globals/Settings.ts` was publicly readable — anyone could `GET /api/globals/settings` and receive the live SMTP password and Resend API key in plaintext JSON.
  - `Media`, `MediaCategory`, `NewsCategory`, `NewsEvents` collections had fully public `create`/`update`/`delete` access — anyone could upload arbitrary files, deface/delete news content, unauthenticated.
  - `Media`'s `mimeTypes: ['image/*', ...]` allowed `image/svg+xml` uploads with no sanitization — stored XSS risk.
  - `/api/revalidate` GET has zero auth check in code (docs claimed reverse-proxy-level protection, unverified).
  - No security headers configured anywhere (CSP/X-Frame-Options/HSTS/etc).
  - Also found: login brute-force lockout is actually fine (Payload's defaults apply, just not explicit in code).
- Ran a second research pass on localization architecture: confirmed Payload's native `localization` config is entirely unused today; discovered the site already runs a **hacky client-side Google Translate widget** (`src/components/GoogleTranslate.tsx`, wired into every page via `LanguageProvider` in `layout.tsx`) as a stand-in for real translation — invisible to search crawlers, prone to mistranslation, meant to be fully replaced by this work, not run alongside it.
- Ran a design-validation pass on the two riskiest pieces: (1) confirmed via direct source inspection that `payload migrate:create` cannot be trusted for the localization schema change here, because this repo's migration snapshot lineage (`src/migrations/*.json`) has been stale since `20260721_103049_init_news_sections` — every migration since is hand-written raw SQL with no snapshot update, meaning any localization migration must also be hand-written, not generated; also found `src/migrations/index.ts` has a live bug (imports `20260811_170000_remove_settings_global` but never adds it to the exported array, so it never runs) that should be fixed first, independently. (2) Validated that a `next-intl` + `[locale]` route-segment approach is required for the locale-prefixed routing/SEO requirement — a hand-rolled middleware+headers() approach would force the entire site into dynamic SSR-on-every-request rendering, breaking the existing static-generation + on-demand-revalidation model, and would collide with 3 existing legacy `/ar/*` redirects in `next.config.mjs`.
- **Full 4-phase plan approved by user, saved to `PLAN_SECURITY_I18N.md`** (Phase 1: security hardening, no schema changes; Phase 2: Payload native localization data model for EN/AR across 10 globals, migration required; Phase 3: Gemini AI auto-translation with admin UI button + draft/publish flow; Phase 4: `next-intl`-based locale-prefixed public routing + SEO + removal of the Google Translate widget). Not yet implemented — pick up from that file next session.
- Added standing rules to `CLAUDE.md`: all edits non-destructive, and a git-commit rollback checkpoint required before any risky change.

**Open items for next session**:
- Implement Phase 1 (security hardening) first — it's fully self-contained and safe to do regardless of the rest.
- Phase 2's production migration explicitly requires the user's direct VPS/database access (backup, maintenance window) — not executable from this environment alone.
- Phase 3 needs a real Gemini API key from the user before it can be verified end-to-end.

---

## 2026-08-29 — Repo fetched, local dev environment set up

**Status**: ✅ Local dev environment fully working (frontend + admin verified with HTTP 200)

- Cloned `https://github.com/mahmoudsakr-ms/gtni-site` (main branch, single "Initial commit") into the workspace.
- No system Node.js/pnpm/sudo available in this environment — installed Node v22.22.0 standalone under `~/.local/node` (added to `PATH`), activated pnpm 10.17.1 via corepack.
- Ran `pnpm install --shamefully-hoist --node-linker=hoisted` (per `README_DEPLOY.md` requirements for Payload) — succeeded after a few retries due to npm registry flakiness (ETIMEDOUT/EAI_AGAIN, not a project issue).
- Created local `.env` (gitignored) with a freshly generated `PAYLOAD_SECRET`, `DATABASE_URL=file:./.db`, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`.
- **Found & fixed a fresh-install gap**: `src/migrations/` has no base "create schema" migration — the earliest migration assumes tables like `student_life` already exist (it renames them). Running `pnpm run payload migrate` against an empty DB fails (`no such table`).
  - Fix: changed `src/payload.config.ts` `db.push` from hardcoded `false` to `process.env.DATABASE_PUSH === 'true'`, and set `DATABASE_PUSH=true` in local `.env` only. This lets the SQLite adapter push the current schema directly for local dev. Production is unaffected (env var unset there → still `push: false`, still uses the migration chain as documented).
- Verified with `pnpm run dev`: homepage `/` and all 8 frontend routes (about-gtni, admission, courses, news-events, nursing-programs, scholarships, student-services, vacancies) return HTTP 200; `/admin` loads (HTTP 200) — fresh DB has no admin user yet, so first visit will prompt to create one.
- Created `CLAUDE.md` (project scope + permanent post-feature workflow: security review → verify → commit & push → update progress/memory docs), `MEMORY.md`, `PROGRESS.md` (this file), and `CODEMAP.md` (codebase index, generated by a subagent reading all of `src/`).

**Open items / not yet done:**
- No admin user created yet — first person to open `/admin` locally needs to complete the "create first user" flow.
- Git identity (`user.name`/`user.email`) is not configured in this environment, and there's no GitHub push credential/token available — needed before any commit/push can happen per the CLAUDE.md permanent workflow.
- No actual feature work requested yet this session beyond environment setup and documentation scaffolding.
