# MEMORY.md — Session Carry-Over Notes

Purpose: condensed notes between chat sessions on this project, so context/decisions don't need to be re-explained each time. Append a new dated entry at the top after each session. Keep entries short — decisions, gotchas, preferences, not a transcript.

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
