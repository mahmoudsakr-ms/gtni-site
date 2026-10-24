# MEMORY.md — Session Carry-Over Notes

Purpose: condensed notes between chat sessions on this project, so context/decisions don't need to be re-explained each time. Append a new dated entry at the top after each session. Keep entries short — decisions, gotchas, preferences, not a transcript.

---

## 2026-10-24 — Verified local-testing providers; Gemini key now admin-configurable

**What happened**: picked up the 2026-09-06 uncommitted local-testing-provider work, verified it
end-to-end (unit smoke test + full authenticated HTTP round trip through `/api/ai-translate`), then
the user said they'd generated a real Gemini API key and asked to make it settable from the admin
area rather than only via `.env`. Added a write-only `geminiApiKey` field to the `Settings` global
(same pattern as `googleTranslateApiKey`) and had `route.ts`/`translateContent.ts` resolve the Gemini
key from Settings (env `GEMINI_API_KEY` as fallback) instead of env-only. `TRANSLATE_PROVIDER=gemini`
in `.env` is still the switch that activates this local-testing path at all — that didn't change.

**⚠️ Load-bearing gotcha — do not flip `DATABASE_PUSH=true` on this DB casually**: this local `.db`
is the production-dump-derived, schema-rebuilt DB from the 2026-09-05 session (see
`SESSION_i18n_local_test.md`). It carries 4 known orphan tables already documented there as leftover
from removed features (`scholarships_accommodation_facilities_image`,
`scholarships_blocks_accommodation_block`, `news_events_global_displayed_categories`,
`_news_events_v` — the latter with 39 real rows) that no longer exist in `main`'s current
collection/global TS definitions. Enabling push to add one new column (`settings.geminiApiKey`) made
drizzle-kit propose **dropping all 4 as a side effect** of that unrelated change. Caught it before
accepting (process killed, never answered the `y/N` prompt; `cmp` against a pre-change backup proved
`.db` was untouched). Dropping genuinely-orphaned tables may well be fine eventually, but that should
be a deliberate, reviewed decision — not an incidental side effect of an unrelated field addition.
**For any future additive field on this DB, prefer a one-off raw `ALTER TABLE ... ADD COLUMN` script
via `libsql`** (see `scripts/add-gemini-column.mjs` for the pattern) over flipping `DATABASE_PUSH`,
unless you've first reviewed drizzle-kit's exact proposed diff and deliberately accepted it.

**Other things worth remembering**:
- Local admin login was reset again this session (`admin@gtni.edu.eg`, local DB only) — ask the user
  or re-run `scripts/reset-local-admin.mjs <email> <new-password>` rather than relying on a password
  written down here; don't commit local credentials to this file either.
- `db_dump/` (the real production DB dump) sits untracked in the repo root and is genuinely sensitive
  (real content, possibly real user data) — it is **not** caught by the `/.db*` gitignore patterns
  (different path). Never `git add -A`/`git add .` in this repo while it's present; add files by name.
  Worth adding an explicit `/db_dump/` gitignore entry at some point.
- The user pastes real API keys directly into the admin UI (Settings global), never into chat —
  keep steering them there instead of asking for the key value directly.

---

## 2026-09-06 — Local test against real prod data + keyless translation (uncommitted)

**What happened**: user pulled the live DB (`db_dump/gtni.db`) and wanted the translate flow working
locally without a paid Google Cloud key. All local, nothing pushed. See `SESSION_i18n_local_test.md`
for the blow-by-blow; `PROGRESS.md` for the summary.

**Key outcomes**:
- Proved the whole Phase 3/4 translate→draft→publish→`/ar` flow works against **real content** with a
  **keyless** provider (MyMemory): `footer` translated to Arabic and went live on `/ar`, EN untouched.
- Added env-gated providers in `src/utilities/translateContent.ts` — `TRANSLATE_PROVIDER=free`
  (MyMemory) and `=gemini` (AI Studio free tier, `GEMINI_API_KEY`). **Production path (`translateStringsWithGoogle`,
  env unset) is byte-for-byte unchanged.** Not committed — decide later if worth keeping.

**Gotchas discovered (worth remembering)**:
- The dump is pre-Phase-2 schema. `scripts/build-local-i18n-db.mjs` builds the localized schema onto
  a *copy* + backfills `en` + rebuilds divergent base tables to match `main` exactly. First version
  only bolted new tables on → publish broke with `NOT NULL constraint failed` on the leftover moved
  columns. This is a **local disposable build, not** the still-deferred production migration.
- **Never run a `payload run` write-script while `pnpm run dev` is up** — two processes on `./.db`,
  writes get lost (hit this twice with the admin password reset). Stop dev first.
- **Publishing a global must go through the running dev server** (REST `POST /api/globals/<slug>?draft=false`
  `{"_status":"published"}`), not `payload run` — the `afterChange`→`revalidatePath()` hook throws
  outside a Next request context.
- MyMemory anonymous quota (~1000 words / rolling window / IP) is too small for big globals or
  repeated testing — set `MYMEMORY_EMAIL` or use Gemini.
- Local admin login for the built DB: `admin@gtni.edu.eg` / `<redacted-local-only-password>` (local only; re-run
  `scripts/reset-local-admin.mjs` after any `cp db_dump/gtni.db .db`).

**Still the real remaining work** (unchanged): a usable translation key (Gemini free tier recommended),
then translate/review/publish all globals; production deployment of the Phase 2 schema migration still
needs direct VPS access.

---

## 2026-08-30 — Phase 4 done: ALL 4 PHASES OF PLAN_SECURITY_I18N.md NOW COMPLETE

**What happened**: Implemented and thoroughly verified Phase 4 (public-facing locale routing via `next-intl`) — the last phase of the plan. Committed as `ade9e20` (+ plan doc `c2f2e6b`), **not yet pushed**. The site now has real bilingual (EN/AR) public routing: `/about-gtni` (English, unchanged) and `/ar/about-gtni` (new), with proper canonical/hreflang SEO tags and a real language-switcher link. The old client-side Google Translate widget (`GoogleTranslate.tsx`) is gone.

**If picking this up next session**, the actual remaining work is narrow:
1. **Get a real Google Cloud Translation API key from the user** and verify actual translation output end-to-end (enter it under Settings > AI Translation, click "Translate with AI" on a global, check the Arabic draft, publish it, confirm it shows correctly on `/ar/...`). Also worth checking whether "GTNI" survives translation unmangled.
2. **Production deployment** — this whole plan has been built and verified only against the local disposable dev DB. Deploying to the real production site needs: (a) the Phase 1 security fixes (safe, no schema changes, can ship anytime), (b) the Phase 2 localization schema change, which needs a **hand-written** migration (not `payload migrate:create` — see `PLAN_SECURITY_I18N.md` Phase 2 for why) validated against a real copy of production's `.db`, requiring the user's direct VPS access — this is a distinct, separate piece of work from everything done so far.
3. Nothing else from the original 3-part request (security hardening, manual translation fields, Gemini/Google AI translation) remains — all implemented and locally verified. Only real-world validation (a real API key, a real production deploy) is left.

**Reminder — don't confuse two similarly-named things** (still relevant): `src/components/GoogleTranslate.tsx` no longer exists (removed in Phase 4). The Google Cloud Translation API used by Phase 3's AI-translate feature lives in `src/utilities/translateContent.ts` — an unrelated, server-side thing that happens to share the "Google Translate" name.

---

## 2026-08-30 — Phase 3 reworked and completed: Google Cloud Translation API

**What happened**: Phase 3 was first built against Gemini, then the user asked (mid-session) to swap to the Google Cloud Translation API instead. Confirmed the swap scope explicitly: keep the same admin button / schema-driven field walker / draft→publish workflow, only swap the translation call. Implemented and verified. Committed locally as `f9a1211` (+ plan doc update `6b42f6b`), **not yet pushed** — user paused before deciding.

**Key design decision (still true)**: the translation engine is schema-driven (`collectTranslatableRefs` in `src/utilities/translateContent.ts`, renamed from `geminiTranslate.ts`) — it reads the `localized: true` flags already set on each global's fields (from Phase 2) rather than maintaining a hand-written manifest per global.

**Reminder — don't confuse two similarly-named things**: `src/components/GoogleTranslate.tsx` is the OLD client-side widget that Phase 4 will remove (crawler-invisible, mistranslation-prone anti-pattern). The Google Cloud Translation API adopted in this Phase 3 rework is a completely different, unrelated, server-side thing (`src/utilities/translateContent.ts`). Same "Google Translate" name, nothing else in common.

**Gotcha worth remembering**: renaming an existing Payload field locally (`geminiApiKey`→`googleTranslateApiKey`) can trigger an interactive drizzle-kit prompt during `DATABASE_PUSH=true` schema push that hangs forever with no TTY. Fix: reset the disposable local `.db*` files and let it rebuild fresh.

**Still open going into next session**:
- Confirm push of commit `f9a1211` (+ `6b42f6b`) — per-phase push confirmation policy.
- Still need a real Google Cloud Translation API key from the user to verify actual translation output (everything up to and including the real network call has been verified; no real translation has ever been produced). Worth spot-checking whether "GTNI" survives translation unmangled, since Cloud Translation (unlike Gemini) has no steerable "preserve this term" instruction.
- Phase 4 (public-facing locale routing via `next-intl`) is the last phase — most invasive: restructures routes under `[locale]`, removes `src/components/GoogleTranslate.tsx`, updates `next.config.mjs` redirects.

---

## 2026-08-30 — Phase 2 (CMS localization) implemented

**What happened**: Implemented and verified Phase 2 of `PLAN_SECURITY_I18N.md` — Payload native localization (EN/AR) + drafts across all 10 page globals + the NewsEvents global. Committed locally as `c6be416`, not yet pushed.

**Critical implementation detail for Phase 3** (the Gemini translation endpoint, not yet built): when writing translated values back into a localized array field via the Local API, **always include the existing array row's `id`** in the update payload. Omitting it makes Payload create a new row instead of updating the existing one, silently orphaning the other locale's data for that array position. Verified this directly against the raw SQLite tables during Phase 2 testing — not a Payload bug, just an easy mistake for any API caller (including our future translate endpoint) to make.

**Still open going into next session**:
- Confirm push of commit `c6be416` (per-phase push confirmation is the agreed policy from Phase 1).
- Phase 3 (Gemini AI auto-translation) is next — needs a real Gemini API key from the user before it can be verified end-to-end.
- Production deployment of the Phase 2 schema change is still fully deferred — needs a hand-written migration validated against a real copy of production's `.db`, which requires the user's direct VPS access. Do not attempt to generate/guess this migration without that real data to test against.

---

## 2026-08-30 — Phase 1 (security hardening) implemented

**What happened**: Continued from the approved `PLAN_SECURITY_I18N.md`. Implemented and verified Phase 1 in full (see `PROGRESS.md` for the file-by-file list) — committed locally as `15f1868`, not yet pushed pending user confirmation.

**Still open going into next session**:
- Confirm push of commit `15f1868` (and decide push policy for the rest of the multi-phase work — confirm every phase, or pre-authorize pushing through to the end).
- Phase 2 (localization data model) is next: touches all 10 content globals, needs a hand-written SQLite migration (see `PLAN_SECURITY_I18N.md` for why `payload migrate:create` can't be trusted here), and its production deployment step explicitly requires the user's direct VPS/DB access — not doable from this sandbox alone.
- Phase 3 needs a real Gemini API key from the user before it can be verified end-to-end.

---

## 2026-08-29 — Security + localization + AI-translation plan approved, not implemented

**What happened**: User asked to (1) fix the `force-reset-pd` backdoor and harden security project-wide, (2) add manual translation fields/controls to the CMS, (3) integrate Google Gemini for AI auto-translation with a click-to-translate admin flow (translate → save draft → publish → visible via public language switcher). Went through full plan-mode research (security audit + localization architecture + design validation via subagents) and produced an approved 4-phase plan. **User had to leave before implementation started** — plan is saved at `PLAN_SECURITY_I18N.md` in the repo root, read that file first next session.

**Standing rules the user set** (now also in `CLAUDE.md`): all edits must be non-destructive, and a git commit must exist as a rollback checkpoint before any risky change.

**Key decisions made during planning** (see `PLAN_SECURITY_I18N.md` for full detail):
- Languages: English (default) + Arabic to start; more addable later via config.
- Media uploads: drop SVG from allowed MIME types entirely (was a stored-XSS vector) rather than trying to sanitize.
- Gemini API key: stored in the `Settings` global (DB-editable via admin UI), not a `.env` var — this also fixes `Settings.ts` being an orphaned/unregistered global.
- Public language switching: locale-prefixed URLs (`/about-gtni` stays English/unprefixed, `/ar/about-gtni` is new) via `next-intl`, not a cookie-based toggle — required for real hreflang/canonical SEO since crawlers don't carry cookies. User explicitly asked for "canonical for SEO purposes," which settled this.
- `NewsEvents` **collection** (individual articles, has its own hand-rolled `_status` draft field) is explicitly excluded from the Phase 2 localization/versions changes — don't touch it, it already works; only the `NewsEvents` **global** (page config) gets localized.
- The existing `src/components/GoogleTranslate.tsx` widget (wired site-wide via `LanguageProvider` in `layout.tsx`) is the thing this whole effort replaces — remove it in Phase 4, don't run it alongside real localized content.

**Gotchas discovered (important for implementation)**:
- `src/migrations/*.json` snapshot lineage is stale since `20260721_103049_init_news_sections` — every migration since is hand-written raw SQL with no snapshot update. `payload migrate:create` cannot be trusted for the Phase 2 localization migration; it must be hand-written in the same defensive style as recent migrations.
- `src/migrations/index.ts` has a live bug: imports `20260811_170000_remove_settings_global` but never adds it to the exported `migrations` array, so it silently never runs. Fix this first, before any new schema work, as part of Phase 1.
- Payload's SQLite adapter moves a newly-localized field's data into a sibling `<table>_locales` table — additive DDL, but the *data backfill* (copying existing English values into the new `en` locale rows) must be hand-written in the migration or existing content reads back empty.
- A hand-rolled middleware + `headers()` approach for locale routing would force the entire site into dynamic SSR, breaking the existing static+on-demand-revalidation model — use `next-intl` with a `[locale]` route segment instead.
- Production deployment of the Phase 2 schema migration needs the user's direct VPS/database access (backup, maintenance window) — not something doable from this sandboxed dev environment alone.

**Open questions for the user next session**: none pending — plan is fully approved, just needs implementation to begin (Phase 1 first, it's self-contained).

---

## 2026-08-29 — Initial setup session

**What happened**: Cloned the repo fresh, stood up local dev (Node/pnpm installed user-locally, no sudo available), got both frontend and `/admin` working. Created the four standing docs (`CLAUDE.md`, `PROGRESS.md`, `MEMORY.md`, `CODEMAP.md`).

**Decisions & why**:
- Made `db.push` in `src/payload.config.ts` configurable via `DATABASE_PUSH` env var (default false, same as before) instead of leaving it hardcoded `false`, because the committed migration history has no base schema migration and can't run against an empty DB. Local `.env` sets it to `true`; production must never set it.
- Chose to install Node/pnpm user-locally (`~/.local/node` + corepack) rather than requesting sudo, since no root access is available in this sandbox.

**Gotchas for next time**:
- `pnpm install` against the public npm registry was flaky in this sandbox (ETIMEDOUT/EAI_AGAIN) — just retry, it resumes from cache and gets further each time.
- Cloning this repo is slow/large (~574MB `.git`) — allow several minutes, don't assume a hang.
- No git identity or GitHub push credentials configured in this environment — will need to be set up before the "commit & push" step of the standing workflow in `CLAUDE.md` can run.
- Fresh local DB has zero users — visiting `/admin` for the first time prompts to create the first admin account.

**Open questions for the user**:
- What name/email should be used for local git commits in this environment?
- How should pushes to GitHub authenticate (personal access token, SSH key, gh CLI login)?
