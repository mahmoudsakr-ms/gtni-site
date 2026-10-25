# PROGRESS.md — GTNI Website

Running chronological log of work done on this project. Newest entry on top.

---

## 2026-10-25 (2) — Local baseline migration, so a fresh DB no longer needs DATABASE_PUSH

**Status**: ✅ Done, tested end-to-end against a truly fresh/empty database (not the working `.db`).
Committed locally, not pushed. **Explicitly local dev tooling only** — not validated against, and not
safe to blindly run against, production.

**The gap**: `src/migrations/` has 20 real migrations (all dated 2026-07/08) that production has
genuinely applied for real, and nothing after them — every schema change since (Phase 2 localization,
Phase 3 Settings/AI-translate, today's security/UI-UX fixes) has only ever existed locally via
`DATABASE_PUSH=true`. Tried running `pnpm run payload migrate` against a truly empty database
directly: failed immediately — not just the known "`student_life` doesn't exist" issue, but more
fundamentally, `payload_migrations` (Payload's own bookkeeping table) was *never created by a
migration at all*, only ever by push. And Payload snapshots "which migrations already ran" exactly
once, at the very start of the `migrate` command, before any migration's own code runs — so a
migration cannot mark *other* migrations as already-applied for its own run (confirmed by trying
exactly that and watching it have no effect).

**The fix — two new files, zero changes to any of the 20 existing migration files**:
- `src/migrations/00000000_000000_initial_schema.ts`: dumped verbatim from a truly fresh database that
  was freshly `DATABASE_PUSH`-ed against current `main` (161 tables, byte-accurate — not hand-written
  or reconstructed), registered first in `src/migrations/index.ts`. Creates the entire current schema
  in one step.
- `scripts/seed-migration-history.mjs`: **required first step**, run once against a brand-new empty
  database before `pnpm run payload migrate`. Creates `payload_migrations` and marks the 20 old
  migration names as already-applied (batch 1) — necessary because several of them are not safe to
  actually replay against the final schema (confirmed: one does a `SELECT` against a `scholarships`
  column that a later migration already renamed away, and fails with "no such column" if actually
  re-executed here). The 20 files and their names are completely untouched, since those exact names
  are what production's real `payload_migrations` table already has recorded for real.

**Verified exactly as requested**: fresh empty `.db` → `seed-migration-history.mjs` → real
`pnpm run payload migrate` (not a reconstructed CLI invocation) → `next dev` pointed at that database
on an isolated port → `/admin` correctly showed the create-first-user flow → registered a user via
`/api/users/first-register` → logged in successfully → full 10-route page sweep all 200. 161 tables,
21 `payload_migrations` rows (20 seeded + the new baseline, which actually ran for real). Full project
`pnpm run lint` and `tsc --noEmit` both clean (caught and fixed one real issue of my own along the
way: the generated file's ~700 catch blocks needed `catch (e: any)` to match this project's existing
migration style under strict TypeScript — an isolated single-file tsc check missed it; the full
project check with the real `tsconfig.json` caught it).

**Still open / explicitly out of scope**: deploying any of this to the real production database — that
remains the separate, deferred task requiring a real copy of production's `.db` and direct VPS access,
exactly as already documented for the Phase 2 migration.

## 2026-10-25 — Full-project security/E2E/UI-UX audit, 3 fixing passes, all merged

**Status**: ✅ Audits complete, fixes reviewed and merged locally (`cdf67de`, `b380964`, `33946f6` +
one DB-column commit). Not yet pushed — pending user confirmation. `CSP` and "write an actual test
suite" explicitly deferred, not attempted.

**What happened**: user asked for a full security audit, a full E2E bug hunt, and a full UI/UX
inspection of the entire codebase (report only, no fixes), then asked for "consultancy agents" to
fix everything found. Ran as 3 parallel read-only audit agents, consolidated into a published
Artifact ("Triage Board", filterable by severity/domain, 46 findings), then 3 parallel fixing agents
— each in an isolated `git worktree` with its own branch, dev-server port, and copy of `.env`/`.db`
so they couldn't collide with each other or the live session.

**Security audit** (full findings in the Artifact) — most significant: all 11 page globals had
`access: { read: () => true }` + `versions: { drafts: true }`, so an unpublished draft (e.g. a
not-yet-reviewed AI translation) was readable by anyone via `?draft=true`, unauthenticated — Payload's
`access.read` has no visibility into the draft flag. Also found: admin cookie missing `Secure`, no
pagination cap on `custom-news-events` (confirmed live with `?limit=1000000`), CMS-editable links
rendered with no URL-scheme validation (`javascript:` XSS risk), no rate limit on `/api/ai-translate`,
a timing-unsafe revalidate-token comparison, and an unused dependency (`javascript-obfuscator`).

**E2E audit**: the test suite (`pnpm run test`) is completely non-functional — no `vitest.config.mts`,
no `playwright.config.ts`, zero spec files exist anywhere in git history, despite `CLAUDE.md` mandating
"run relevant tests" after every change. Also: no timeout on the YouTube-thumbnail HEAD check caused
10-37s page hangs (confirmed: this sandbox has zero YouTube egress, so every one of the 32 video items
with no uploaded thumbnail hit this unprotected path), the Gemini model name was stale/retired by
Google, a relationship field rejected a stringified numeric ID with a confusing error, and two small
`/api/revalidate` validation gaps.

**UI/UX audit** (largest, ~26 findings): most serious was the News & Events article body being
**entirely commented out** in `NewsEventsClient.tsx` — every "read more" showed only a hero image and
excerpt, never the actual content. Also a latent `next/image` bug on the Vacancies hero (missing
`fill`, masked locally because no hero image happens to be uploaded), no confirmation before
"Translate with AI" overwrites an existing hand-edited draft, systemic keyboard-accessibility gaps on
every clickable content card (About pages, News/Events, homepage, alumni map), the entire custom admin
field library missing `aria-describedby`/`aria-invalid` on validation errors, and a recurring RTL bug
where a decorative "accent bar" design element used physical `border-l`/`pl-*` instead of logical
properties, visually detaching from right-aligned Arabic text on nearly every content page.

**Fixing passes — notable things caught during review before merging, not just "ran and merged"**:
- The security-fix agent discovered the *literal* fix I'd suggested for the draft-leak bug (a
  `beforeOperation` hook forcing `args.draft = false`) **doesn't work** in Payload 3.74 — `draft` is
  destructured out of `args` before any `beforeOperation` hook runs. It built a working alternative
  (stash intent on `req.context` in `beforeOperation`, read it back in `access.read`, which runs later
  but before the draft-substitution code) and I independently re-derived the same conclusion by
  reading Payload's installed source before trusting it.
- The UI/UX agent, fixing the commented-out article body, discovered the field it referenced
  (`item.content`) never existed in the `NewsEvents` schema at all — added it properly (optional,
  additive) rather than just uncommenting a block that would've been a no-op.
- **Caught and fixed a real security gap during my own merge review**: the UI/UX agent independently
  added its own link-sanitization function (correctly spotting the same `javascript:`-URI risk the
  security agent had already fixed elsewhere) but its regex didn't strip embedded control characters
  before checking the scheme, so `"java\tscript:alert(1)"` passed through unsanitized even though a
  real browser's URL parser strips the tab and still executes it as `javascript:`. Proved the bypass
  with a live test, then resolved the merge conflict by keeping the already-merged, more robust
  `sanitizeUrl()` and deleting the weaker duplicate.
- The UI/UX agent got cut off mid-task by a session rate limit (not its own error) with 7 commits
  landed and good uncommitted work in progress; resumed it the next day once the reset had passed and
  it finished the remaining ~15 findings.
- The UI/UX agent's own `pkill -9 -f "next dev"` (fighting a stuck port) was too broad and killed
  sibling dev servers — turned out to be a red herring for the real incident: my own background
  `pnpm install` (regenerating the lockfile after removing the unused dependency) pruned 43 transitive
  packages, including one needed by `@payloadcms/ui`'s client bundle, out from under a *running* dev
  server sharing that `node_modules` via symlink — a stale webpack cache then threw `ENOENT` on a file
  that genuinely no longer existed. Fixed with a clean `rm -rf .next` restart, same as previous
  cache-corruption incidents this project has hit.
- The new `content` field on `NewsEvents` needed an actual DB column; each fixing agent's isolated
  `.db` copy got the column added directly via `libsql` (`scripts/add-newsevents-content-column.mjs`,
  same surgical-`ALTER TABLE` pattern as the earlier Gemini-key column), but the **main checkout's**
  `.db` still needed the same column added by hand after merging — found via a live `ENOENT`/"no such
  column: content" error, fixed the same way, re-verified.

**Verified after all three merges**: `pnpm run lint` clean, `tsc --noEmit` clean, full 14-route sweep
200 on the real local database (not a fixture), the draft-leak fix (`403` unauthenticated, `200`
authenticated), the secret-field status indicator (`"✓ A value is currently set (hidden)"` vs. `"Not
configured"`, computed from real data, real secret still `null`), RTL logical classes and the nav
`aria-label` present in live `/ar/...` HTML, and the news-events API (previously erroring on the main
DB) now `200`.

**Explicitly deferred, not attempted by any agent**: site-wide CSP (needs dedicated testing against
the admin panel to avoid lockout) and writing an actual test suite from scratch (foundational enough
to need a real scoping conversation on conventions/coverage, not an unsupervised pass).

**Still open**: a real production migration for the `NewsEvents.content` column (same caveat as every
other schema addition this project — the production migration chain is still a separate, deferred,
hand-written effort). `pnpm-lock.yaml` is now back in sync after removing `javascript-obfuscator`.

## 2026-10-24 (2) — Fixed a real bug: write-only Settings fields never rendered in the admin UI

**Status**: ✅ Fixed, verified, committed locally. Not yet pushed — pending user confirmation.

**The bug**: after adding the admin-configurable Gemini key (previous entry), the user reported the
new field didn't appear when clicking its tab. Investigation (reading Payload 3.74's actual installed
source, since no real browser could be launched in this sandbox — see below) found this was **not**
caused by the new field at all: `access: { read: () => false }` — the exact pattern already used for
`smtpPass`, `resendApiKey`, and `googleTranslateApiKey` since Phase 1/3 — makes Payload's
`RenderFields` component (`@payloadcms/ui/dist/forms/RenderFields/index.js`) skip rendering the field
**entirely** (`if ("name" in field && !hasReadPermission) return null`), not just hide its value. This
is a genuine pre-existing bug that predates this session: **nobody has ever been able to set these 4
secret fields through the admin UI** — `scripts/set-translate-key.mjs` exists precisely because this
was already silently broken, discovered during the 2026-09-06 session but never diagnosed.

**The fix** (`src/globals/Settings.ts`): added a shared `writeOnlySecretField` object applied to all 4
fields —
- `access.read` changed from `() => false` to `({ req }) => Boolean(req.user)`, so the Admin UI's
  field-permission check now passes and the field actually renders.
- Added `hooks.afterRead: [({ overrideAccess, value }) => (overrideAccess ? value : null)]`. Payload
  runs custom field hooks *before* its access-control field-stripping step, so this unconditionally
  nulls the returned value whenever access control is in effect (Admin UI's own render-fetch,
  REST/GraphQL) — except when `overrideAccess` is true, which is Payload Local API's default for
  trusted server-side code (e.g. `ai-translate/route.ts`'s own `payload.findGlobal` call, which needs
  the *real* key to actually call the translation provider). Net effect: an authenticated admin can
  now see the field and type a new value; the stored secret is still never returned by any
  access-controlled read, exactly matching the original "write-only" intent — now actually achieved
  instead of achieved-by-accident-via-breaking-the-form.
- **Caught and fixed a self-inflicted near-miss during this fix**: the first version of the hook
  returned `undefined` instead of `null`. Payload treats a hook returning `undefined` as "leave value
  unchanged" — so that version silently did nothing, and a live test (`POST` a real-looking key,
  immediate `GET`) proved the plaintext value came right back. Caught before anything beyond a
  deliberately-fake test string was ever exposed; fixed to return `null`, then re-verified.

**Verified**: after the fix, set distinct fake values for all 4 fields via REST — `POST` response and
every subsequent `GET /api/globals/settings` (authenticated) return `null` for all 4; unauthenticated
`GET` still `403`s (global-level access untouched); the admin edit page's own rendered form state now
includes all 4 fields with masked `null` values (confirms they render); and critically, `POST
/api/ai-translate` with `TRANSLATE_PROVIDER=gemini` **did** read the real stored key server-side and
reach Google's live Gemini endpoint (`400 API key not valid` for the fake key) — proving the trusted
Local API path still works and the write-only guarantee holds everywhere else. `pnpm run lint` clean,
full route sweep 200.

**Browser testing note**: could not launch a real browser in this sandbox to visually confirm —
Playwright's bundled Chromium doesn't support this host's OS (`ubuntu26.04-x64` isn't yet in
Playwright 1.56.1's platform table) and `playwright install-deps` needs `sudo` (not available here).
Diagnosed instead by reading Payload's actual installed client-side source
(`node_modules/.pnpm/@payloadcms+ui@*/.../fields/{Tabs,RenderFields}/index.js`) and by inspecting the
real server-rendered admin page's embedded form-state JSON for proof each field is now part of the
rendered tree. User should do a final visual confirmation in their own browser.

---

## 2026-10-24 — Verified local-testing providers; added admin-configurable Gemini API key

**Status**: ✅ Committed locally. Not yet pushed — pending user confirmation.

**Part 1 — verified the 2026-09-06 local-testing-provider work (was uncommitted, unverified since)**:
- Ran `pnpm run dev` against the production-dump-derived local DB; full 9-route EN/AR sweep + `/admin`
  all 200.
- `scripts/translate-smoke.ts` (`payload run`) against `translateStringsFree` directly: 3 samples
  including one >450 chars, confirming the chunk-split/rejoin logic end-to-end. Acronym handling
  matched the already-documented limitation (sentence-leading "GTNI" got expanded by MyMemory;
  mid-sentence survives) — not a regression.
- Full HTTP path: reset local admin password, logged in via `/api/users/login`, called
  `POST /api/ai-translate {globalSlug:"header", targetLocales:["ar"]}` with `TRANSLATE_PROVIDER=free`
  and no Google key configured → `200 {"ar":{"fieldsTranslated":13}}`, confirming the route's
  no-API-key-needed bypass for local providers works through real auth, not just in unit tests.
- `pnpm run lint` clean throughout.

**Part 2 — user supplied a real Gemini API key, asked to wire it into the admin UI** (previously the
Gemini local-testing path only read `GEMINI_API_KEY` from `.env`, no admin-UI way to set it):
- `src/globals/Settings.ts`: new write-only `geminiApiKey` field (same `access.read: () => false`
  pattern as `googleTranslateApiKey`/`smtpPass`/`resendApiKey`), in its own "AI Translation (Gemini —
  testing)" tab, explicitly labeled as the local-testing path, not production.
- `src/app/api/ai-translate/route.ts`: resolves the key per active provider —
  `settings.geminiApiKey || process.env.GEMINI_API_KEY` when `TRANSLATE_PROVIDER=gemini`, otherwise
  `settings.googleTranslateApiKey` as before — and returns a provider-specific "no key configured"
  400 message. `TRANSLATE_PROVIDER` env var is still the on/off switch for which provider runs (local
  testing only, unchanged); only *where the Gemini key comes from* changed.
- `src/utilities/translateContent.ts`: `translateStrings`' gemini branch now uses the `apiKey` param
  (resolved by the caller) instead of re-reading `process.env.GEMINI_API_KEY` itself.
- `src/components/payload/TranslateButton.tsx`: help text generalized from "using Google Translate" /
  "Requires a Google Translate API key" to provider-neutral wording, since the active provider is now
  an invisible server-side choice.
- Schema: added the `gemini_api_key TEXT` column to the local `settings` table.

**⚠️ Near-miss, now documented as a standing gotcha**: flipping local `.env`'s `DATABASE_PUSH` to
`true` (the normal way to sync a new field into the local SQLite schema) triggered drizzle-kit's
interactive push prompt proposing to **drop 4 unrelated tables with real data**
(`scholarships_accommodation_facilities_image`, `scholarships_blocks_accommodation_block`,
`news_events_global_displayed_categories`, `_news_events_v` — 39 rows) — pre-existing schema drift
between `main`'s current collection/global definitions and this production-dump-derived local DB,
unrelated to the new field. The prompt was never answered (no `y` sent) and killing the process
confirmed via `cmp` against a pre-change backup that `.db` was byte-identical — **nothing was lost**.
Added `scripts/add-gemini-column.mjs` (raw `ALTER TABLE settings ADD COLUMN ...` via `libsql`,
bypassing drizzle-kit entirely) to add just the one intended column, and reverted `DATABASE_PUSH` back
to `false` immediately. **Do not set `DATABASE_PUSH=true` on this particular local DB again** without
first reviewing drizzle-kit's proposed diff very carefully, or use the same surgical-ALTER approach —
see `MEMORY.md`.

**Verified**: regenerated `payload-types.ts` (new `geminiApiKey` field present); settings read via
REST confirms the new field (like all the others in that tab) is correctly write-only (never in the
response); `POST /api/ai-translate` returns the new Gemini-specific "no key configured" message
before a key is set, and after setting a placeholder key via `POST /api/globals/settings`, the request
correctly reaches Google's real Gemini endpoint (`400 API key not valid` — same verification pattern
originally used for the Google Translate key in Phase 3). `pnpm run lint` clean. Full route sweep 200.

**Still open**: user needs to paste their real Gemini key into Settings > AI Translation (Gemini —
testing) via the admin UI (not pasted into chat, for key hygiene) to actually test EN→AR translation
output. `db_dump/` (the real production dump) remains untracked/uncommitted on purpose — it is **not**
covered by an explicit `.gitignore` entry beyond the repo root `.db` patterns; never `git add` it.

---

## 2026-09-06 — Local testing against real production data + keyless translation (NOT committed yet)

**Status**: local-only work, no commits. Uncommitted app changes on `main`:
`src/utilities/translateContent.ts` (+~290 lines), `src/app/api/ai-translate/route.ts` (7 lines).
Plus untracked `scripts/` (local tooling), `db_dump/` (the VPS dump), `SESSION_i18n_local_test.md`.
Full detail: **`SESSION_i18n_local_test.md`**.

**What happened**: user downloaded the live production DB (`db_dump/gtni.db`) and wanted to run the
site + test the "Translate with AI" flow locally, then asked to do it **without a Google Cloud API
key**.

- **Ran `main` against real production content locally.** The dump is on the pre-Phase-2 schema
  (57 tables); `main` needs the localized schema (~161). Built `scripts/build-local-i18n-db.mjs`:
  creates the missing `*_locales` / `*_v` tables from a reference schema, backfills every existing
  value into the `en` locale, then **rebuilds every divergent base table to exactly match `main`'s
  schema** (needed — publish rewrites base+locale tables and hit `NOT NULL` on leftover columns).
  `[SHAPE] all 161 tables match reference`, FK-clean. This is a **disposable local build, NOT the
  deferred production migration.**
- **Keyless translation** — added two env-gated providers to `translateContent.ts` (dispatcher
  `translateStrings`); production (env unset) still uses `translateStringsWithGoogle` unchanged:
  - `TRANSLATE_PROVIDER=free` → MyMemory, no key. **Verified E2E**: `footer` → Arabic (9 fields) →
    published → `/ar` renders Arabic footer, `/` still English. Also `header` (13 fields). Limit:
    MyMemory's anonymous quota (~1000 words/rolling-window/IP) — fine for small globals, not the
    whole site; `MYMEMORY_EMAIL` raises it.
  - `TRANSLATE_PROVIDER=gemini` → Gemini AI Studio **free tier** (free key, no billing),
    `GEMINI_API_KEY` env. Restored/adapted from the original Phase 3 Gemini impl (`c390071`). One
    batched call per doc. **Not yet tested** — needs a free key.
  - `route.ts`: skips the "no key → 400" guard when `TRANSLATE_PROVIDER` is `free`/`gemini`.
  - Security-reviewed (fixed hosts, URL-encoded params, header auth for Gemini + 60s timeout, no new
    deps, auth gate untouched). Lint + `tsc --noEmit` clean.

**Local admin**: `admin@gtni.edu.eg` / `<redacted-local-only-password>` (reset in the local DB only; VPS unchanged).

**Open**: pick a provider for real use (recommend Gemini free key); translate + review + publish the
remaining globals; decide whether any of `scripts/` + the `translateContent.ts` provider switch is
worth committing (it's a clean, production-safe, env-gated addition). The **live VPS was never
contacted.**

---

## 2026-08-30 — Phase 4 implemented: public-facing locale routing (next-intl) — ALL 4 PHASES COMPLETE

**Status**: ✅ Phase 4 of `PLAN_SECURITY_I18N.md` complete and verified, committed (`ade9e20`, plan doc updated in `c2f2e6b`). Not yet pushed. This was the last phase — `PLAN_SECURITY_I18N.md`'s full scope is now implemented.

- Added `next-intl`. Created `src/i18n/{routing,navigation,request}.ts` and `src/middleware.ts` (matcher excludes `/admin`, `/api`, static assets). `next.config.mjs` wrapped with `next-intl/plugin`.
- Moved every route under `src/app/(frontend)/` into `src/app/(frontend)/[locale]/` via `git mv`. Root layout gained `generateStaticParams`, `<html lang dir>`, and a `notFound()` guard for bad locales.
- `Nav`/`Footer` take a `locale` prop; all 9 pages' `generateMetadata` + default export now thread `locale` into their Payload calls and build real `alternates.canonical`/`alternates.languages` via new `src/utilities/localeMetadata.ts`. Fixed a real bug found along the way: `news-events/page.tsx`'s `unstable_cache` call had a single shared cache key across all locales (would have served the wrong locale's cached data) — now locale-scoped.
- `src/utilities/revalidate.ts` now revalidates both the English and `/ar`-prefixed path for every affected route. `next.config.mjs` redirects fixed: removed 4 that would have shadowed the new real Arabic routes (`/ar/admission`, `/ar/courses`, `/ar/vacancies`, bare `/ar`), and repointed the rest at Arabic-prefixed destinations. `sitemap.ts` now emits both locale variants.
- **Removed** `src/components/GoogleTranslate.tsx` (the old client-side widget + its mistranslation-patching dictionary) entirely — the whole point of this multi-phase effort. Simplified `src/components/SmartText.tsx` (depended on it) to a plain passthrough rather than touching its ~9 call sites. Language switcher in `NavClient.tsx` is now a real next-intl `Link`.

**Verified thoroughly**:
- Full `pnpm run build` succeeds, both `/en` and `/ar` static params generated for every page. This surfaced (and I fixed) two real pre-existing TypeScript errors in the Phase 3 code that `next lint` had not caught (an unsafe `Settings` cast; a `data` argument type mismatch on `updateGlobal`).
- Ran both the built production server and `pnpm run dev`: full 9-route sweep at 200 for English (unprefixed, e.g. `/about-gtni`) and Arabic (`/ar/about-gtni`); bare `/ar` serves the Arabic homepage; `/en/about-gtni` correctly 307-redirects to the canonical unprefixed URL (avoiding duplicate-content URLs); an unconfigured locale (`/fr/about-gtni`) cleanly 404s at the routing level, never reaching page code.
- Confirmed `<html lang dir>` correct per locale; canonical + all three hreflang alternates (en/ar/x-default) present and correct in page source.
- Confirmed the CMS save → revalidate hook still works end-to-end against the built static pages (edited a global field via the admin API, confirmed the live page updated without a rebuild, restored the original value).
- Admin panel and GraphQL API fully unaffected (200) throughout. Lint clean.

**What's genuinely still open** (see `PLAN_SECURITY_I18N.md`'s final section for full detail):
1. A real Google Cloud Translation API key from the user — to verify actual translation output (everything up to the live network call is verified, but no real translation has ever been produced).
2. Production deployment of the Phase 2 schema migration — needs the user's direct VPS/database access, explicitly out of scope for this environment.

---

## 2026-08-30 — Phase 3 implemented: Gemini AI auto-translation

**Status**: ✅ Phase 3 of `PLAN_SECURITY_I18N.md` complete, verified as far as possible without a real Gemini API key, committed (`c390071`). Not yet pushed.

- Registered the previously-orphaned `Settings` global in `payload.config.ts`; added `geminiApiKey` (write-only) and `geminiModel` fields under a new "AI Translation (Gemini)" tab.
- `src/utilities/geminiTranslate.ts`: schema-driven translation engine. `collectTranslatableRefs` walks a global's actual field config (the same `localized: true` flags from Phase 2) alongside its real data — clones everything, collects only the translatable leaf text/textarea/richText values for translation, leaves ids/media refs/structural fields untouched. This resolves the Phase 2 array-id pitfall by construction rather than by convention. Rich text is handled by walking the Lexical AST and replacing only leaf `text` values. `translateStringsWithGemini` batches a whole document's strings into one Gemini call per target locale using structured JSON-array output.
- `src/app/api/ai-translate/route.ts`: authenticated POST endpoint (401 anonymous), whitelists the 10 translatable globals (Settings itself excluded), validates target locales, reads the Gemini key server-side only, writes translations back as **drafts** per locale.
- `src/components/payload/TranslateButton.tsx`: shared admin UI button (locale checkboxes + "Translate with AI"), wired into all 10 translatable globals via `admin.components.elements.beforeDocumentControls`.
- Security refinement found during self-review: switched the Gemini API key from a `?key=` URL query param to the `x-goog-api-key` header, so it can't end up in access logs or leak into a raw fetch-error message.

**Verified (no real Gemini key available yet)**:
- Auth gating, input validation, and the "no key configured" error path all confirmed via curl.
- Confirmed `geminiApiKey` is genuinely write-only (never returned by an authenticated read).
- Set a placeholder key and confirmed the full pipeline runs correctly through a real network call to Gemini — got Google's own "invalid API key" error back, proving the request reaches Gemini correctly (re-verified after switching to header auth).
- Exercised the real field walker against the live `AboutGTNI` global (11 strings correctly collected across nested collapsible/group/array fields), pushed the result through the real HTTP API: English untouched, Arabic draft correctly translated under the **same** array row ids as English, published Arabic still correctly falls back to English pre-publish.
- Full 9-route + `/admin` sweep still 200. Lint clean.

**⚠️ SUPERSEDED same session.** After committing this, the user decided to swap the translation provider from Gemini to the Google Cloud Translation API instead. See the entry below (same day) for the rework — this entry is kept for history only.

---

## 2026-08-30 — Phase 3 reworked: Google Cloud Translation API (replacing Gemini)

**Status**: ✅ Phase 3 reworked, verified as far as possible without a real API key, committed (`f9a1211`, plan doc updated in `6b42f6b`). Not yet pushed.

Confirmed with the user that the swap should be minimal: keep the same admin button, same schema-driven field walker, same draft→publish workflow — only swap the underlying translation API call. Implemented exactly that:

- `src/utilities/geminiTranslate.ts` renamed to `src/utilities/translateContent.ts`. `collectTranslatableRefs` (the field-walking logic) is unchanged. The low-level call now hits Google Cloud Translation's "Basic" v2 endpoint (`POST translation.googleapis.com/language/translate/v2?key=...`) — simpler than Gemini's call: a plain array of strings in, translations back in the same order, no prompt engineering or JSON-schema response mode needed.
- `src/globals/Settings.ts`: `geminiApiKey`/`geminiModel` replaced with a single `googleTranslateApiKey` field (still write-only), tab relabeled "AI Translation (Google Translate)".
- `src/app/api/ai-translate/route.ts` and `TranslateButton.tsx` updated for the new field name/simpler call signature.
- **Known trade-off vs. Gemini**: Cloud Translation is literal NMT with no steerable tone or "preserve this proper noun" instruction (Gemini could be prompted to keep "GTNI" as-is and use a professional institutional tone). In practice short acronyms are usually left alone by NMT engines, but this needs a real key to confirm.
- **Gotcha found**: renaming `geminiApiKey`→`googleTranslateApiKey` triggered an interactive drizzle-kit prompt during the local `DATABASE_PUSH=true` schema push (create-new vs. rename-column disambiguation), which hangs forever with no TTY. Fixed by resetting the disposable local dev DB. Worth remembering for any future field rename during local dev, and a reminder that the eventual hand-written production migration needs to treat renames explicitly (not rely on auto-detection).

**Verified (still no real API key)**: full re-run of the same verification suite as the original Gemini version — auth gating, input validation, write-only field, a live network call to Google's real endpoint with a placeholder key (got the expected "API key not valid" error back, confirming the request reaches Google correctly; hit one transient `ETIMEDOUT` on the first attempt matching earlier sandbox network flakiness, succeeded on retry), and the array-row-id preservation test re-confirmed against the live `AboutGTNI` global through the real HTTP API. Full 9-route + `/admin` sweep still 200. Lint clean.

**Next**: user paused before pushing this or continuing to Phase 4. Still need: (1) push confirmation for this Phase 3 rework, (2) a real Google Cloud Translation API key to verify actual translation output, (3) Phase 4 (public-facing locale routing via `next-intl`, removing the existing `GoogleTranslate.tsx` widget) — the last phase, not started.

---

## 2026-08-30 — Phase 2 implemented: CMS localization data model

**Status**: ✅ Phase 2 of `PLAN_SECURITY_I18N.md` complete, verified locally, committed (`c6be416`). Not yet pushed — pending user confirmation. Production deployment explicitly out of scope (needs a hand-written migration validated against a real copy of the production DB — see plan).

- `src/payload.config.ts`: added `localization` config — English (default) + Arabic, `fallback: true` (untranslated content shows English instead of blank).
- Added `localized: true` to every visible-text field (text/textarea/richText) across all 10 page-content globals (`Header`, `Footer`, `Home`, `AboutGTNI`, `Admission`, `Courses`, `NursingPrograms`, `Scholarships`, `StudentServices`, `Vacancies`) plus the `NewsEvents` global (page settings). Left non-localized: slugs/IDs, URLs/links, course codes/prerequisites, media/relationship refs, and other structural fields (select/checkbox/date/number). Each of these 11 globals also got `versions: { drafts: true }` — native save-draft/publish per document, which Phase 3's AI-translate flow will use.
- **Deliberately untouched**: the `NewsEvents` *collection* (individual articles) — it already has a working hand-rolled `_status` field; combining that with native versioning is a separate, riskier change, deferred per the plan.
- Regenerated `src/payload-types.ts`.

**Verified locally** (fresh disposable dev DB, `DATABASE_PUSH=true`):
- Confirmed actual SQLite shape matches the plan's prediction: a `<table>_locales` sibling table appears the first time any field on that table becomes localized; `<slug>_v` tables appear for the new `versions.drafts`.
- Full round-trip: set English (published) → Arabic read falls back to English → saved Arabic as a **draft** → public read still shows English fallback, draft preview shows Arabic → **published** the draft → Arabic now live, English untouched. Exactly the "translate → draft → publish" flow requested.
- **Important gotcha found and resolved** (not a real bug, a testing pitfall worth remembering for Phase 3): updating a localized array field *without* including the existing row's `id` makes Payload treat it as a brand-new row, silently orphaning the other locale's data for that array position. Including the correct existing `id` (which the real admin UI and any correctly-written Local API call always does) preserves both locales' data correctly. **Phase 3's Gemini translation endpoint must always round-trip existing array row IDs when writing translated content back.**
- All 9 frontend routes + `/admin` still 200. Lint clean.

**Next**: Phase 3 (Gemini AI auto-translation) — needs a real Gemini API key from the user to verify end-to-end. Push of this Phase 2 commit still needs confirmation (per the agreed per-phase check-in policy).

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
