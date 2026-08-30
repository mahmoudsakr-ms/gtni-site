# PROGRESS.md — GTNI Website

Running chronological log of work done on this project. Newest entry on top.

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
