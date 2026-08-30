# MEMORY.md — Session Carry-Over Notes

Purpose: condensed notes between chat sessions on this project, so context/decisions don't need to be re-explained each time. Append a new dated entry at the top after each session. Keep entries short — decisions, gotchas, preferences, not a transcript.

---

## 2026-08-30 — Phase 3 (Gemini AI translation) implemented

**What happened**: Implemented and verified (as far as possible without a real API key) Phase 3 of `PLAN_SECURITY_I18N.md`. Committed locally as `c390071`, not yet pushed. User does not have a Gemini API key to provide right now — proceeded with build-now-test-later per their explicit choice.

**Key design decision**: the translation engine is schema-driven (`collectTranslatableRefs` in `src/utilities/geminiTranslate.ts`) — it reads the `localized: true` flags already set on each global's fields (from Phase 2) rather than maintaining a separate hand-written manifest per global. Adding a new localized field to any global automatically makes it translatable with zero changes needed in Phase 3 code.

**⚠️ Decision reversed later in the same session**: right after this was committed, the user said to use the **Google Translate API** instead of Gemini. Commit `c390071` (the Gemini-based Phase 3) was deliberately **left unpushed** — don't push it as-is. The user then chose to pause for the day before any rework happened, so:

**Still open going into next session — start here**:
1. **First, nail down the actual decision**: confirm with the user what "use Google Translate API" means precisely (they used "Google Translate API" then, when asked to clarify, confirmed "swap Gemini for Google Translate API" as opposed to just pushing the Gemini commit — but the *scope* of the swap wasn't discussed: same architecture with a different translation call, or something more different, e.g. Cloud Translation's own glossary/context features, or literally reusing the existing `src/components/GoogleTranslate.tsx` client-side widget instead of a server-side translation-and-draft flow). The original request (see `PLAN_SECURITY_I18N.md`'s Context section) explicitly asked for Gemini by name with a professional-tone, click-to-translate-then-draft-then-publish workflow — re-confirm whether that workflow (draft/publish, admin button, schema-driven field walker) stays the same and only the translation API call itself swaps to Google Translate, since that's the minimal-rework interpretation and reuses everything already built and verified in `src/utilities/geminiTranslate.ts` / `src/app/api/ai-translate/route.ts` / `TranslateButton.tsx`.
2. Once confirmed, rework `src/utilities/geminiTranslate.ts` (rename appropriately) to call Google's Cloud Translation API instead of Gemini's generateContent endpoint. Note: Cloud Translation API needs a different auth mechanism (typically an API key tied to a Google Cloud project with the Translation API enabled and billing set up, or a service account) — this is NOT the same kind of key as a Gemini AI Studio key, so the Settings global's `geminiApiKey`/`geminiModel` fields likely need renaming/adjusting too.
3. Then push the corrected Phase 3 commit.
4. Phase 4 (public-facing locale routing via `next-intl`) is the last phase in the plan — most invasive: restructures routes under `[locale]`, removes the existing `src/components/GoogleTranslate.tsx` widget (note: same file name as the API being swapped to for Phase 3 -- don't confuse the *existing client-side widget* being removed in Phase 4 with the *new server-side Google Translate API* being adopted in Phase 3's rework; they are unrelated despite the similar name), updates `next.config.mjs` redirects.

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
