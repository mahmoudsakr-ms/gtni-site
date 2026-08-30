# GTNI Website: Security Hardening + CMS Localization + AI Translation

**Status: APPROVED, NOT YET IMPLEMENTED.** Saved here so it survives across sessions — pick this up next time by re-reading this file plus `CLAUDE.md`/`PROGRESS.md`/`MEMORY.md`, then implement phase by phase.

## Context

Three requests, tackled as four sequenced, independently-committed phases (each phase = its own git checkpoint, verified before moving on — per your standing rules below).

**Standing rules (added permanently to `CLAUDE.md`)**:
- All edits are non-destructive: prefer additive schema/config changes; never drop existing data or working functionality without an explicit, separate, confirmed step.
- Before any risky change (schema migration, access-control change, routing change), ensure the working tree is committed clean — that commit **is** the rollback checkpoint (`git revert`/`git reset` back to it if something breaks). Never leave multiple unrelated risky changes uncommitted at once.

**Why now**: a security review surfaced during setup found far more than the one backdoor originally flagged — public unauthenticated write access to content/media, and CMS secrets (SMTP password, email API key) readable by anyone. This needs fixing before adding more surface area. Separately, the CMS is English-only today (the old site's Arabic support was collapsed into English URLs, and the *current* site papers over this with a client-side Google Translate widget — `src/components/GoogleTranslate.tsx`, wired into every page via `LanguageProvider` in `src/app/(frontend)/layout.tsx` — invisible to search crawlers and prone to mistranslation, which is precisely what this work replaces). The goal is real, CMS-managed, professionally AI-translated content, served from real crawlable per-locale URLs.

Two research passes (security audit, localization/routing architecture) and one design-validation pass already happened in the planning session — findings are folded directly into the phases below rather than re-derived.

---

## Phase 1 — Security Hardening (no schema changes; pure code/config)

**Findings being fixed**:

| Severity | Issue | File |
|---|---|---|
| Critical | `settings` global is publicly readable — SMTP password + Resend API key returned to anyone via `/api/globals/settings` or GraphQL | `src/globals/Settings.ts` |
| Critical | `Media`, `MediaCategory`, `NewsCategory`, `NewsEvents` collections allow unauthenticated create/update/delete — arbitrary file upload, content defacement/deletion | `src/collections/Media.ts`, `MediaCategory.ts`, `NewsCategory.ts`, `NewsEvents.ts` |
| Critical | `Media` accepts `image/*`, including `image/svg+xml`, with no sanitization — stored XSS via uploaded SVG | `src/collections/Media.ts` |
| High | `force-reset-pd` endpoint: unauthenticated password reset/user creation gated only by a token shared with an unrelated webhook | `src/collections/Users.ts` |
| High | `/api/revalidate` GET has no auth check at all in code | `src/app/api/revalidate/route.ts` |
| High | No security headers anywhere (CSP/X-Frame-Options/HSTS/etc.) | `next.config.mjs` |
| Medium | No explicit CORS/CSRF config in Payload | `src/payload.config.ts` |
| Medium | Unbounded `LIKE` search param | `src/app/api/custom-news-events/route.ts` |
| Bug (unrelated but must fix first) | `20260811_170000_remove_settings_global` migration is imported but never added to the exported `migrations` array — it never runs, leaving the migration chain silently out of sync with disk | `src/migrations/index.ts` |

**Changes**:
- `src/collections/Users.ts` — delete the `endpoints: [...]` array (`force-reset-pd`) entirely. Declare `auth.maxLoginAttempts`/`lockTime` explicitly (matching Payload's existing defaults: 5 / 10 min) for auditability — no behavior change, just makes it visible in code.
- `src/globals/Settings.ts` — change `access.read` from `() => true` to `({ req }) => Boolean(req.user)` (matches its own existing `access.update` pattern). Add field-level `access: { read: () => false }` to `smtpPass` and `resendApiKey` so secrets are never returned even to authenticated users via API (write-only, same convention as Payload's own password fields).
- `src/collections/Media.ts`, `MediaCategory.ts`, `NewsCategory.ts` — keep `read: () => true` (public site needs this), change `create`/`update`/`delete` to `({ req }) => Boolean(req.user)`. Change `Media`'s `mimeTypes` from `['image/*', ...]` to an explicit list without SVG: `['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/x-msvideo']`.
- `src/collections/NewsEvents.ts` — same `create`/`update`/`delete` lockdown. Additionally harden `read` as a defense-in-depth measure: `({ req }) => req.user ? true : { _status: { equals: 'published' } }` so anonymous users can never fetch draft articles directly by ID even though they're technically public-read.
- `src/app/api/revalidate/route.ts` — add a real check: require a `token` query param (or `x-revalidate-token` header) equal to `process.env.CACHE_REVALIDATION_TOKEN`; reject with 401 if missing/mismatched. Set a real value for `CACHE_REVALIDATION_TOKEN` in local `.env` (currently unset).
- `src/app/api/custom-news-events/route.ts` — cap the `search` param length (e.g. reject/truncate over ~200 chars) before it reaches the `like` query.
- `next.config.mjs` — add a `headers()` function applying `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Permissions-Policy` site-wide. **Not** adding a full CSP in this pass — Payload's admin panel is sensitive to CSP misconfiguration (risk of locking out admin access), so that's called out as explicit follow-up work requiring dedicated testing, not bundled in here.
- `src/payload.config.ts` — add explicit `cors: [process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean)` and `csrf: [process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean)`.
- `src/migrations/index.ts` — add the missing `migration_20260811_170000_remove_settings_global` entry to the exported `migrations` array (fixing the drift bug called out above, independent of everything else, before any new schema work happens on top of this chain).

**Verification**: `pnpm run lint`; start dev server; confirm with `curl`: anonymous `POST /api/media`, `PATCH/DELETE /api/news-events/:id`, `GET /api/globals/settings` all now rejected (401/403); anonymous `GET` on public content still works; `POST /api/users/force-reset-pd` now 404s; login still works; `/admin` still loads and an authenticated session can still edit Settings/Media/NewsEvents normally. Commit as its own checkpoint.

---

## Phase 2 — CMS Localization Data Model (schema change; migration required)

**Scope**: English + Arabic to start (more locales addable later by editing config). Applies to the 10 page-content globals — `Header`, `Footer`, `Home`, `AboutGTNI`, `Admission`, `Courses`, `NursingPrograms`, `Scholarships`, `StudentServices`, `Vacancies`, plus the `NewsEvents` **global** (the listing-page config, not the collection). **Explicitly excluded**: the `NewsEvents` **collection** (individual articles) — it already has a working hand-rolled `_status` draft/publish field; combining that with Payload's native versioning in the same pass is a separate, riskier migration and is deliberately deferred so we don't destabilize a working production feature while doing everything else.

**Config**:
```ts
// src/payload.config.ts
localization: {
  locales: [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية', rtl: true },
  ],
  defaultLocale: 'en',
  fallback: true,
},
```
Per field, the pattern (applied once, repeated across all 10 globals — not enumerated field-by-field here): every field that renders visible text on the public site (`text`, `textarea`, `richText`) gets `localized: true`. Structural fields do not: slugs, media/relationship references, colors, order/position fields, booleans, dates. For arrays/blocks (e.g. `AboutGTNI`'s leadership members, `Home`'s hero slider), localize only the leaf text fields inside them (`label`, `title`, `bio`, etc.) — leave the array itself non-localized so row order/count/images stay shared across locales and only the translatable text forks per locale.

Add `versions: { drafts: true }` to each of these 10 `GlobalConfig` objects, giving Payload's native save-draft/publish UI per document (this is what "save translation, then publish" maps onto).

**What actually happens in SQLite** (confirmed by reading `@payloadcms/drizzle`'s schema builder directly): a localized field's value moves off the base table into a sibling `<table>_locales` table (`_parent_id`, `_locale`, plus only the localized columns) — genuinely additive DDL. `versions: { drafts: true }` creates a `<slug>_v` table holding version history separate from the live table.

**Why this can't just be `payload migrate:create`**: confirmed via direct inspection that this repo's migration snapshot lineage (`src/migrations/*.json`) is stale — the last paired snapshot is from `20260721_103049_init_news_sections`, and every migration since has been hand-written raw SQL with no snapshot update. `migrate:create` diffs against that stale snapshot, not the real database, so it cannot be trusted to generate a correct migration here — it would likely try to "fix" things that were already hand-migrated weeks ago. Combined with the pre-existing missing-genesis-migration issue, **the localization migration must be hand-written**, following the same defensive style as the repo's recent migrations (`db.run(sql\`...\`)`, wrapped in try/catch, `IF NOT EXISTS` guards, safe to re-run partway).

**The migration must, for every table gaining its first localized field**:
1. `CREATE TABLE IF NOT EXISTS <table>_locales (...)` with the localized columns.
2. `INSERT INTO <table>_locales (_parent_id, _locale, <cols>) SELECT id, 'en', <cols> FROM <table>` — backfill existing English content as the `en` locale row. **This step is the actual risk in this phase** — skip it and existing content reads back empty until republished.
3. Table-rebuild the base table to drop the now-migrated columns (SQLite needs create-new/copy/drop-old/rename for this, not a bare `ALTER TABLE DROP COLUMN`, matching how Payload's own generated migrations do it elsewhere in this repo).
4. `CREATE TABLE IF NOT EXISTS <slug>_v (...)` and seed one initial version row per global from its current live data, so the admin version timeline isn't empty on day one.

**Production deployment is out of scope for the coding session that implements this** — it requires access to the production VPS/database that this environment doesn't have. This phase delivers and verifies everything **locally** against the disposable local dev DB (via the existing `DATABASE_PUSH=true` workaround, which is safe here precisely because there's no real data to lose). Shipping this to production is a separate, later step that needs direct involvement: back up the real `.db`, copy it somewhere the hand-written migration can be tested against real data, schedule a maintenance window (stop PM2, back up again, run `payload migrate`, spot-check `en`/`ar` content via admin, restart). This plan does not attempt that handoff — flagged here so it isn't a surprise later.

**Verification (local)**: `pnpm run generate:types`; start dev server with `DATABASE_PUSH=true`; confirm each of the 10 globals now shows locale-specific fields in the admin UI with a working Save Draft / Publish flow; confirm existing English content still displays correctly for the `en` locale.

---

## Phase 3 — AI Auto-Translation (Google Cloud Translation API)

**✅ Implemented and reworked in-session.** Originally built against Gemini, then the user asked to swap to the Google Cloud Translation API ("Basic" v2 — plain API key, no service account/GCP project wiring) instead, keeping everything else the same. What follows describes the final, Google-Translate-based implementation.

**API key storage**: in the `Settings` global (already locked down in Phase 1) — a single `googleTranslateApiKey` text field with `access: { read: () => false }` (write-only, same convention as `smtpPass`/`resendApiKey`). This also finally makes `Settings` a registered, functioning global (registered in `payload.config.ts`'s `globals` array — was previously orphaned/unregistered dead code).

**Translation utility** (`src/utilities/translateContent.ts`): `collectTranslatableRefs` walks a global's field schema (the same `localized: true` flags from Phase 2) alongside its real data, cloning everything and collecting only translatable text/textarea/richText leaf values — schema-driven, no per-global manifest needed. For Lexical rich-text fields: walks the AST, collects only leaf `text` values, splices translations back into a **cloned** tree, never touching `type`/`format`/`children`. `translateStringsWithGoogle` sends a batch of strings directly to Cloud Translation's v2 endpoint (`POST https://translation.googleapis.com/language/translate/v2?key=...`, body `{ q: string[], source, target, format: 'text' }`) and gets back translations in the same order — simpler than an LLM call, no prompt engineering needed. Trade-off vs. the original Gemini design: this is literal NMT with no steerable tone or "preserve this proper noun" instruction (in practice, short acronyms like "GTNI" are typically left as-is by NMT engines since they're unrecognized words, but this hasn't been confirmed with a real key yet).

**API route** (`src/app/api/ai-translate/route.ts`, `POST`): authenticated via Payload's standard pattern (`payload.auth({ headers })`, reject if no `user`). Accepts `{ globalSlug, targetLocales: string[] }`, validates `globalSlug` against an explicit whitelist of the 10 translatable globals, validates locales against the configured non-default locales, reads the API key server-side only via the Local API, translates, and writes results back via `payload.updateGlobal({ slug, locale: targetLocale, draft: true, data: {...} })` — landing as a **draft**, ready for human review before publish.

**Admin UI** (`src/components/payload/TranslateButton.tsx`): checkboxes for each non-default configured locale (currently just Arabic) + a "Translate with AI" button, calling the endpoint and showing loading/success/error state. Registered via each of the 10 globals' `admin.components.elements.beforeDocumentControls` — one shared, parameterized component, not duplicated per global.

**Verified without a real key** (none available yet): auth gating, input validation, the write-only field, and a live network call to Google's real endpoint with a placeholder key (got Google's own "API key not valid" error back, confirming the request reaches the API correctly). Also re-verified the array-row-id preservation guarantee (from Phase 2 testing) still holds through the real HTTP API. **Still needed**: a real Google Cloud Translation API key from the user, to verify actual translation output end-to-end and spot-check whether "GTNI" survives translation unmangled.

**Gotcha for future field renames on Payload globals during local dev**: renaming an existing field (as happened here, `geminiApiKey`→`googleTranslateApiKey`) can trigger an interactive drizzle-kit prompt during the `DATABASE_PUSH=true` local schema push (asking whether to treat it as a new column or a rename), which hangs forever in a non-interactive environment. Fix: reset the disposable local dev DB (`rm .db*`) and let it rebuild fresh — safe locally since there's no real data, but a reminder that renames need more care for the eventual hand-written production migration.

---

## Phase 4 — Public-Facing Locale Routing & SEO

A design-validation pass surfaced that a hand-rolled middleware-rewrite approach (the original idea) has two real problems: it would collide with three existing legacy `/ar/*` redirects in `next.config.mjs`, and reading a middleware-injected header via `headers()` in the shared root layout would force the **entire site** into dynamic (SSR-on-every-request) rendering, silently breaking the existing static-generation + on-demand-revalidation model (`/api/revalidate` + `revalidatePath`). The robust, standard fix for "default locale unprefixed, others prefixed, real crawlable URLs, no forced dynamic rendering" is **`next-intl`** with a `[locale]` route segment.

**Changes**:
- Add `next-intl` dependency.
- Restructure routes: `git mv` everything under `src/app/(frontend)/` into `src/app/(frontend)/[locale]/...` (mechanical, one-time move — not a folder duplicated per locale). `layout.tsx` moves too and receives `params: { locale }` directly — no `headers()` needed.
- `src/middleware.ts` (new): `next-intl`'s `createMiddleware` with `defineRouting({ locales: ['en','ar'], defaultLocale: 'en', localePrefix: 'as-needed' })` — English stays unprefixed at its exact current URLs (non-destructive to existing SEO/backlinks), Arabic becomes `/ar/...`.
- `generateStaticParams` returns `['en', 'ar']` so both locales remain fully statically generated, preserving current caching behavior.
- `Nav`/`Footer`/every page's data fetch takes `locale` as a real param and passes it into `payload.findGlobal({ slug, locale })` / `payload.find({ ..., locale })`.
- `generateMetadata` in every page: proper `alternates.canonical` (locale-specific URL, not a hardcoded shared one) and `alternates.languages` (`en`, `ar`, `x-default`) — this is what actually satisfies "canonical for SEO," since crawlers need distinct, properly cross-linked URLs per language, which cookie-based switching cannot provide.
- Language switcher: `next-intl`'s locale-aware `<Link>` in the nav — a real navigable link to the same page in the other locale, not a client-side toggle.
- `src/utilities/revalidate.ts` / `src/app/api/revalidate/route.ts`: update path generation to revalidate both the unprefixed and `/ar`-prefixed versions of each affected route, since they're now genuinely separate static renders.
- `next.config.mjs`: fix the three colliding legacy redirects (`/ar/vacancies`, `/ar/admission`, `/ar/courses` → currently collapse into the English URL, which would now permanently shadow the real new Arabic pages at those same paths) and reconsider the bare `/ar` → `/` redirect (should resolve to the Arabic homepage instead).
- **Remove** `src/components/GoogleTranslate.tsx` and its `LanguageProvider` wiring in `layout.tsx` entirely — it's the exact crawler-invisible, mistranslation-prone mechanism this whole effort replaces; running it alongside real localized content would actively re-translate already-correct Arabic text.

**Verification**: `pnpm run build` (confirms static generation still works for both locales); visit `/about-gtni` (English, unchanged URL) and `/ar/about-gtni` (new) in a browser; confirm the language switcher navigates correctly both ways; view source and confirm `hreflang`/canonical tags are present and correct; confirm a `/api/revalidate` call updates both locale variants of a page.

---

## Sequencing & Checkpoints

Each phase ships as its own commit, only after its own verification passes — matching the rollback-checkpoint rule. Phase 1 is fully self-contained and should land first regardless of anything else. Phases 2–4 build on each other in order; Phase 2/3 are useful and independently verifiable (content gets translated and stored) even before Phase 4 exposes it on the public site. Production deployment of the Phase 2 migration is explicitly flagged as follow-up work requiring direct VPS/database access, not something implemented in this coding session.
