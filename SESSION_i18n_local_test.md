# Session log — 2026-09-05 — Run Google Translate (Phase 3) locally against real production content

## Goal

Import the freshly-downloaded live production DB into the local dev environment, run the site, and
test the **"Translate with AI" / Google Cloud Translation** feature (Phase 3 of
`PLAN_SECURITY_I18N.md`) end-to-end in the admin portal — **local only, nothing touching the live VPS.**

## Key finding — schema mismatch

| | Schema | Content |
|---|---|---|
| **`db_dump/gtni.db`** (from the live VPS) | pre-localization (57 tables), last migration `20260811_170000_remove_settings_global` | real: 77 media, 35 news articles, 12 faculty + 9 board members, all page globals, 3 users |
| **`main` branch** (all 4 phases) | localized (~161 tables: `*_locales`, `*_v` version tables), `Settings` global re-added | expects the above |

No Phase 2 migration file was ever written — the localized schema only ever existed locally via
`DATABASE_PUSH=true`. So the production dump cannot be run directly on `main`, and pushing the schema
onto it would drop the columns holding real content.

## Decision

Chosen approach (user picked "Match production code" first, then "run google translate locally"):
**build the localized schema onto a copy of the real dump and backfill every existing value into the
`en` locale**, so `main` runs against real content locally. This is a disposable-DB build for local
testing — **NOT** the production migration (that stays deferred, must be hand-written + reviewed).

Earlier in the session the repo was briefly checked out at `1d9c7ee` (pre-Phase-2) to view the site
exactly as production serves it; then moved to `main` for the translation work.

## What was done

1. **Backed up** the old disposable dev DB → `.db.backup_predump_20260905_170132` (161-table schema,
   near-empty — now used only as the schema reference).
2. **`git checkout main`** (from detached `1d9c7ee`). `.env` kept at `DATABASE_PUSH=false`.
3. **`cp db_dump/gtni.db .db`** — fresh working copy of the dump.
4. **`node scripts/build-local-i18n-db.mjs`**:
   - created 109 missing tables (all `*_locales` + `*_v*` version tables + `settings`) from the
     reference schema;
   - added `_status` to the 11 draft-enabled page globals, set to `'published'`;
   - created 255 indexes;
   - backfilled every non-version `*_locales` table with one `en` row per parent row, copying values
     from the (now dead) columns on the dump's base tables — **every localized column carried over,
     nothing dropped**;
   - seeded the `settings` global row (API key left NULL);
   - `PRAGMA foreign_key_check` clean.
5. **`node scripts/verify-local-i18n-db.mjs`** — ALL CHECKS PASSED (161 ref tables present, locale
   row counts match parents, globals `published`, `payload_migrations` still 21 rows,
   integrity/FK clean, media=77 / news=35 / faculty=12).
6. **`rm -rf .next && pnpm run dev`** — server up at http://localhost:3000.
7. Route check — all **200**:
   - EN: `/`, `/about-gtni`, `/admission`, `/courses`, `/news-events`, `/nursing-programs`,
     `/scholarships`, `/student-services`, `/vacancies` — real content renders.
   - AR: `/ar`, `/ar/about-gtni`, … — render `lang="ar" dir="rtl"`, showing EN fallback content
     (AR locale intentionally empty, `fallback: true`).
   - `/admin`, `/admin/login`.
   - No errors in the dev log (only the harmless `Missing credentials for "LOGIN"` Nodemailer warning
     and next-intl webpack cache warnings).
8. **Reset a local admin password** — `node scripts/reset-local-admin.mjs admin@gtni.edu.eg …`
   (Payload Local API, proper hash, local DB only). `/api/users/login` → `Authentication Passed`.

## 2026-09-06 — Translate WITHOUT a Google Cloud API key

User asked to run the translate flow with no paid key. Added two env-gated local-only providers to
`src/utilities/translateContent.ts` (dispatcher `translateStrings`); production (env unset) still
uses `translateStringsWithGoogle`, byte-for-byte unchanged.

- **`TRANSLATE_PROVIDER=free`** — MyMemory (`api.mymemory.translated.net`), **keyless**. Sequential,
  self-throttling, splits >450-char strings. **Verified end-to-end**: `footer` → `ar` translated 9
  fields → published via REST → **`/ar` now renders the Arabic footer** ("تمكين الطلاب من تحقيق
  أحلامهم…", "شارع محمد إبراهيم كامل، الجونة…", quick links "الشواغر" / "الأخبار والفعاليات") while
  `/` (EN) is unchanged. (Also proven earlier on `header`: 13 fields.)
  **Limitation:** anonymous quota is tiny (~1000 words per rolling ~10-min-to-24h window per IP) —
  exhausted after ~2 globals. Set `MYMEMORY_EMAIL` in `.env` for a higher free quota. Big globals
  (about-gtni's 12k-char philosophy essay) will not complete anonymously. Acronym preservation is
  inconsistent (mid-sentence "GTNI" survived; sentence-leading "GTNI" got expanded) — caught in the
  translate→review→publish workflow.
- **`TRANSLATE_PROVIDER=gemini`** — Google Gemini via the AI Studio **free tier** (free key, no credit
  card / billing). Key from `GEMINI_API_KEY`, model from `GEMINI_MODEL` (default `gemini-2.0-flash`).
  One batched call per document, prompt instructs "keep GTNI as-is". Restored/adapted from the
  original Phase 3 impl (git `c390071`). **Best option for translating real content.** Needs the user
  to grab a free key at https://aistudio.google.com/apikey — not yet tested end-to-end (no key).

`src/app/api/ai-translate/route.ts`: the "no API key → 400" guard is skipped when
`TRANSLATE_PROVIDER` is `free` or `gemini`. Every new path is dead unless the env var is set;
`.env` is gitignored; production behavior unchanged. Security-reviewed: fixed hosts + URL-encoded
params (no SSRF), Gemini key via `x-goog-api-key` header + 60s timeout, no new deps, auth gate
untouched.

**Publishing a translated draft:** must go through the running dev server, not `payload run` — the
global `afterChange` hook calls Next `revalidatePath()` which throws outside a request context.
`scripts/publish-global.mjs` now logs in over REST and `POST /api/globals/<slug>?draft=false` with
`{"_status":"published"}`.

### DB rebuild (schema-exact)

The first build only bolted the new tables on and left the moved-to-`_locales` columns as dead
columns on the base tables. That broke **publish** (`NOT NULL constraint failed:
header_nav_items.label` — Payload rewrites array rows on publish). `build-local-i18n-db.mjs` now
**rebuilds every divergent base table to match `main`'s schema exactly** (rename-dance, copies the
common columns) after the locale backfill. Result: `[SHAPE] all 161 tables match reference`, FK
check clean. Re-run: `cp db_dump/gtni.db .db && node scripts/build-local-i18n-db.mjs` then
re-run `reset-local-admin.mjs` (a fresh dump copy resets the admin password too).

## Scripts created (`scripts/`, local tooling)

| Script | Purpose |
|---|---|
| `build-local-i18n-db.mjs` | builds localized schema + `en` backfill + schema-exact base-table rebuild onto `./.db` (expects a fresh dump copy) |
| `verify-local-i18n-db.mjs` | post-build sanity checks (read-only) |
| `translate-smoke.ts` | `payload run scripts/translate-smoke.ts` — keyless MyMemory connectivity/chunking check |
| `publish-global.mjs` | `payload run scripts/publish-global.mjs <slug>` — publish a global's current draft (all locales) so AR goes live |
| `set-translate-key.mjs` | `payload run scripts/set-translate-key.mjs "<key>"` — writes the Google API key into `settings` |
| `reset-local-admin.mjs` | `payload run scripts/reset-local-admin.mjs <email> <password>` — local password reset + login verify. **Run with the dev server stopped** (two writers on `./.db` lose the write). |
| `_schema_diff.mjs`, `_leftover.mjs`, `_peek.mjs` | one-off read-only inspection scratch scripts |

Run scripts with the Payload runner so path aliases resolve:
`NODE_OPTIONS=--no-deprecation ./node_modules/.bin/payload run scripts/<name>[.mjs|.ts] [args]`
(the pure-libsql ones — `build`/`verify`/`_schema_diff`/`_leftover`/`_peek` — run with plain `node`).

**Gotcha:** never run a `payload run` write-script while `pnpm run dev` is up — both processes open
`./.db` and a write from one can be lost. Stop the dev server first for password resets / publishes.

## Current state

- **Branch:** `main` (detached → switched back; working tree clean apart from untracked `scripts/`,
  `db_dump/`, `.vscode/`, `SESSION_i18n_local_test.md`).
- **`.env`:** `DATABASE_PUSH=false`.
- **`./.db`:** production content on the localized schema (165 tables = 161 + 4 orphan tables from
  removed features: `_news_events_v`, `news_events_global_displayed_categories`,
  `scholarships_accommodation_facilities_image`, `scholarships_blocks_accommodation_block`).
- **`./.db.backup_predump_20260905_170132`:** the pre-swap disposable dev DB (schema reference).
- **Dev server:** running, http://localhost:3000.

### Local admin login (local DB only — the live VPS password is unchanged)

```
URL:      http://localhost:3000/admin
Email:    admin@gtni.edu.eg
Password: <redacted-local-only-password>
```

## Pending

1. **Pick a translation provider** (`.env` `TRANSLATE_PROVIDER`):
   - `free` (set now) — works, but MyMemory's anonymous quota only covers ~1-2 small globals at a
     time. Fine for a quick demo.
   - `gemini` (recommended for real content) — set `GEMINI_API_KEY` from
     https://aistudio.google.com/apikey (free, no billing), restart dev.
   - unset — production path, needs the paid Google Cloud key in Settings.
2. **End-to-end test:** `/admin` (`admin@gtni.edu.eg` / `<redacted-local-only-password>`) → a small global first
   (Header / Footer / Vacancies) → "Translate with AI" → check Arabic → run → confirm the Arabic
   draft (switch locale selector) → Publish → confirm `/ar/<page>` shows Arabic, EN unchanged.
   Spot-check whether "GTNI" survives untranslated.

## Roll back / resume

- Resume: dev server may need restarting — `cd ~/gtni && rm -rf .next && pnpm run dev`.
- Rebuild the DB from scratch: `cp db_dump/gtni.db .db && node scripts/build-local-i18n-db.mjs`.
- Back to "production as-is": `git checkout 1d9c7ee` + `cp db_dump/gtni.db .db` + `DATABASE_PUSH=false`.
- Back to normal dev: `git checkout main` + restore `.db.backup_predump_20260905_170132` +
  `DATABASE_PUSH=true`.
- The live VPS was never contacted at any point.
