# MEMORY.md — Session Carry-Over Notes

Purpose: condensed notes between chat sessions on this project, so context/decisions don't need to be re-explained each time. Append a new dated entry at the top after each session. Keep entries short — decisions, gotchas, preferences, not a transcript.

---

## 2026-10-26 (3) — The basePath root + next-intl rewrite has now needed TWO separate header/matcher fixes; trust the user's real-server test over a local repro that can't reproduce a bug

Three separate basePath-root edge cases have now been found in this exact code path (middleware
matcher not matching `''`, `next.config.mjs` headers() not applying, and still-unexplained missing
headers on a real pm2-hosted server even after the headers() fix). If this area acts up again,
suspect the basePath-root + next-intl-rewrite interaction first.

When a user reports a bug from real server testing that a local repro (matching env vars, real
build, same Next version) can't reproduce, don't assume the user's test was wrong — add a defensive
fix that closes the gap regardless of root cause (here: setting the headers directly in middleware
as well as via `next.config.mjs`) rather than insisting on root-causing it before acting, especially
when the defensive fix is cheap and can't make things worse.

---

## 2026-10-26 (2) — Production is still running commit 3466c59; it has never been redeployed

**Standing fact worth not forgetting**: as of this session, `gtni.edu.eg` is still running the very
first commit (`3466c59`), confirmed via the server's own `git status`. Every security/code fix landed
on `main` since then — Phase 1 hardening, the basePath fixes, the audit fixes (headers, search,
pagination, hero video, accessibility, the dependency upgrade) — is sitting unused until someone
actually redeploys. Don't assume "fixed on main" means "fixed in production" when discussing this
site; always check which one is actually being asked about.

**Payload's version jumps aren't always straightforward — check `@payloadcms/next`'s own
`peerDependencies` for the real `next` compatibility window before assuming "latest Next" is safe.**
At the time of the 3.74.0→3.91.0 Payload upgrade, `@payloadcms/next@3.91.0` supported `next`
`>=15.2.9 <15.3.0`, `>=15.3.9 <15.4.0`, `>=15.4.11 <15.5.0`, or `>=16.3.3` only — a real gap with no
15.5.x support at all. Relying on changelogs alone wouldn't have caught this as reliably as actually
installing and reading the resolved `peerDependencies` from `node_modules`.

**A `@payloadcms/*` adapter package (e.g. `@payloadcms/email-nodemailer`) can bundle its own nested
copy of the underlying library regardless of what the top-level `package.json` says.** Before bumping
a major version of something like `nodemailer` "because Payload wants it," check whether this app's
own code even touches that package directly (grep `src/` for direct imports) — often it doesn't, and
the adapter's own nested dependency is what actually matters for a CVE fix, making a top-level major
bump unnecessary risk for no benefit.

**A fork/subagent told explicitly "research-only, don't install anything" can still cross into
actually doing the thing**, when empirical verification (actually running `pnpm install` to see what
really resolves) is more reliable than guessing from changelogs. This isn't necessarily bad — it found
a real compatibility constraint this way that research alone likely would have missed or gotten wrong
— but it means re-reading "research" task results with a check for "did it actually modify files"
before assuming nothing changed on disk.

---

## 2026-10-26 — basePath doesn't reach `public/`-folder assets by default; must be fixed explicitly per asset type

**Core fact, easy to assume wrongly**: `next/image`'s default loader does **not** apply `basePath` to
local `src` paths — it builds the `_next/image?url=...` query param from the raw, unprefixed `src`
string (confirmed by reading `next/dist/shared/lib/image-loader.js`). This is different from Payload's
own URL-building (admin/API/media), which *does* already read the derived basePath internally — so
"basePath support" for this app is really two unrelated mechanisms, not one: Payload's own (automatic)
and everything touching `public/` directly (`next/image`, `<img>`, custom-component `src`s, favicon
metadata) which needs **manual** `BASE_PATH` prefixing at every call site, with no shortcut. Checking
only that the rendered HTML `src` attribute *looks* basePath-prefixed is not sufficient verification —
it says nothing about whether the actual image/asset request behind it succeeds. Always curl the real
resolved URL and check for a real 200.

**The admin panel has its OWN separate metadataBase, independent of the frontend's**: `layout.tsx`'s
`metadataBase` (set via `getPublicBaseUrl()`) only covers the public frontend. `@payloadcms/next`'s
admin-panel metadata builder constructs a second, completely separate `metadataBase` from
`config.serverURL` (never set in this project) — so admin-panel favicons etc. need their own explicit
`BASE_PATH` prefix in `payload.config.ts`'s `admin.meta` block; fixing the frontend's metadataBase does
nothing for the admin side.

**Testing gotcha (bash regex), worth remembering before writing another one-off asset-check script**:
`grep -oE '[^"&amp; ]*'`-style negated character classes exclude the individual *characters*
`{", &, a, m, p, ;, space}`, not the literal 4-character substring `&amp;` — this silently truncates
any matched URL at its first `a`/`m`/`p` character, producing false-positive "failures" from malformed
partial URLs. A plain bash one-liner piping a single `grep | head -1 | xargs curl` through an
`&amp;`-encoded HTML srcset has the same failure mode for a different reason: it curls the raw
`&amp;`-encoded string, which curl/the shell splits on the literal `&` inside `&amp;` itself, turning
`&amp;w=256` into a bogus `amp;w=256` param — missing the real `w` the image endpoint requires, so it
400s even though the app is fine. Write a small Node `.mjs` script instead: fetch each page, decode
`&amp;`→`&` in the HTML first, regex out full URLs, then `fetch()` each one directly and check
`.status`. Worth reusing (see git history around 2026-10-26) rather than rewriting from scratch next
time a basePath/asset regression check is needed.

---

## 2026-10-25 (4) — /new deployment's full env var set, and a reconfirmed gotcha

**The `/new` parallel-mount deployment now needs 3 env vars together** (all optional/off by default,
so the main site needs none of them): `NEXT_PUBLIC_BASE_PATH=/new`, `PAYLOAD_COOKIE_PREFIX=payload-new`
(prevents cookie collision with the main site's `payload-token` on the same domain), and
`NEXT_PUBLIC_NOINDEX=true` (sitewide `noindex,nofollow` + empty sitemap, since `/new` shouldn't be
indexed separately from the real site). All three were verified together, as the real intended
combination, in one `pnpm run build && next start` run — not just individually.

**Reconfirmed gotcha (same class as earlier `.next` cache incidents)**: editing `src/payload.config.ts`
while a dev server has it already loaded leaves that server in a broken state (500s) until restarted
— hot-reload doesn't reliably pick up core Payload config changes the way it does for page/component
edits. Always restart (`pnpm run devsafe`) after touching `payload.config.ts`, don't assume dev mode
will catch it.

---

## 2026-10-25 (3) — basePath support added; one real Next.js matcher gotcha to remember

**How to run it locally**: set `NEXT_PUBLIC_BASE_PATH=/new` (any value, including empty/unset for
normal unprefixed deployment) before `pnpm run build`/`pnpm run dev`/`pnpm run start` — it feeds
`basePath` in `next.config.mjs`. Everything else derives from that one var; see `src/utilities/
publicUrl.ts`.

**Load-bearing gotcha, easy to rediscover the hard way**: Next.js strips `basePath` from the pathname
*before* evaluating middleware's `matcher` config. A request for exactly the basePath root arrives at
the matcher as an **empty string**, not `/`. Any matcher regex requiring a leading `/` (the common
`/((?!api|_next).*)` style pattern used almost everywhere, including this project's own
`src/middleware.ts`) silently never matches that one request — middleware just doesn't run, with no
error, no log, nothing — so if `basePath` is ever reintroduced or changed here, double-check the
matcher still has an explicit `'/'` entry alongside the regex. This cost real debugging time: `/new/
about-gtni` worked, `/new/en`'s redirect worked, but bare `/new` 404ed, and the fix wasn't in next-intl
or Payload at all — confirmed only by adding a raw `console.log` at the top of the middleware function
and seeing it never fire for that one path.

**What did NOT need fixing**: Payload's admin routes, REST API, and upload/media URLs are already
basePath-aware internally (`@payloadcms/next`'s `withPayload()` reads `nextConfig.basePath` and
derives `process.env.NEXT_BASE_PATH`, which Payload's `formatAdminURL`/`generateFilePathOrURL` already
use) — confirmed by reading the installed package source, not assumed. Only this project's *own* code
that builds an absolute/literal path by hand needed touching: metadata/sitemap/robots/the password-
reset email link, plus 6 client-side `fetch()`/`<a href>` calls using a hardcoded absolute path
(`BeforeListMedia.tsx`, `CategoryCell.tsx`, `TranslateButton.tsx`, `NewsEventsClient.tsx`,
`AboutPageContent.tsx`) — found via a full-repo grep for the literal pattern, not by reading every
component. A plain `fetch('/api/...')` or `<a href="/...">` never gets basePath-prefixed automatically
the way `next/link`/the router does.

---

## 2026-10-25 (2) — Local baseline migration added; how to bootstrap a fresh DB now

**New local-dev workflow, going forward**: a truly empty database no longer needs
`DATABASE_PUSH=true`. Instead: `DATABASE_URL="file:./x.db" node scripts/seed-migration-history.mjs`
once, then `DATABASE_URL="file:./x.db" pnpm run payload migrate`. See `PROGRESS.md` for why both
steps are required (the seed script isn't optional — `payload migrate` snapshots "already applied"
state once at the very start, before any migration's own code runs, so a migration cannot mark other
migrations as applied for its own invocation). `src/migrations/00000000_000000_initial_schema.ts` is
the new baseline (161 tables, dumped from a real fresh push against current `main` — not hand-written
by guessing). None of the 20 pre-existing migration files were touched, renamed, or reordered.

**User's explicit instruction, worth remembering for any future migration work on this repo**:
don't delete or rename old migration files without asking first — their exact names are what
production's real `payload_migrations` table has recorded as applied; changing a name breaks that
correspondence. This is why the "skip the old 20" mechanism works by *seeding the tracking table*
rather than touching the files/array at all.

**Gotcha, costs real time if forgotten**: an isolated single-file `tsc --noEmit <file> --skipLibCheck
...` with hand-picked compiler flags is NOT equivalent to the project's real `npx tsc --noEmit` (which
uses the actual `tsconfig.json`). The isolated check missed ~700 real errors (`catch (e)` needs
`catch (e: any)` under this project's strict settings, matching the existing migrations' own style)
that only showed up once checked against the real config. Always use the plain project-wide command
for a real gate, not a reconstructed one with assumed flags.

**Gotcha, specific to `payload migrate` on SQLite**: `payload_migrations` (Payload's own bookkeeping
table) is not created by any migration in this repo's history — like everything else pre-2026-10-25,
it only ever existed via `DATABASE_PUSH`. A truly virgin `.db` file fails immediately on `payload
migrate` with `no such table: payload_migrations`, not (only) the previously-known `student_life`
issue.

---

## 2026-10-25 — Full audit + fix pipeline pattern, and two load-bearing gotchas

**What happened**: user wanted a full (not diff-scoped) security audit, E2E bug hunt, and UI/UX
inspection, then fixes for everything found. See `PROGRESS.md` for the findings; this entry is the
*process* worth repeating next time a request has this shape.

**The pattern that worked well — worth reusing**:
1. 3 parallel read-only audit agents (general-purpose, background), each told explicitly what the
   *other two* are concurrently doing against the same shared dev server/DB so they don't collide or
   duplicate each other's checks.
2. Consolidate into one artifact (not 3 walls of chat text) — a filterable "Triage Board" with a
   severity/domain breakdown chart. Genuinely useful as a shared reference, not just a nicer format.
3. 3 parallel *fixing* agents, each in its own **isolated git worktree** (`isolation: "worktree"`) —
   separate branch, separate dev-server port, its own copy of `.env` and `.db`. This is the load-bearing
   choice: without it, 3 agents editing the same live working tree / fighting over the same dev server
   port / racing on the same SQLite file (single-writer, already a known problem this project hits
   repeatedly) would have been unmanageable.
4. **Never trust a fixing agent's self-report as the final word** — review every diff personally
   before merging, re-derive the trickiest claims from primary sources (Payload's actual installed
   source, not docs or memory), and independently re-run the riskiest live tests. This caught two real
   things a blind merge would have shipped: (a) one agent's suggested fix for the draft-leak bug
   literally didn't work, caught by reading Payload's source before accepting the "verified" claim at
   face value; (b) a second agent's own new XSS-sanitization function had a real bypass (tab-character
   scheme-evasion) that its own live test didn't happen to exercise.
5. Merge one branch at a time, immediately after each lands — don't wait for all three and merge in
   one big-bang. Caught/resolved 2 small conflicts (same file touched by two agents for different
   reasons) cleanly this way, each in isolation, rather than one tangled 3-way conflict at the end.

**Gotcha 1 — don't run `pnpm install` against the shared `node_modules` while any dev server
(including worktree-symlinked ones) is live.** Removing one unused dependency pruned 43 transitive
packages; a running server's webpack dev cache held a reference to one of those files and threw
`ENOENT` the moment it needed to recompile. Not data loss, just needs `rm -rf .next` + restart — but
costs real debugging time to diagnose if you don't remember this happened. Prefer running `pnpm
install` with every dev server in the repo stopped, or at least expect to need a clean cache-bust
restart of all of them afterward.

**Gotcha 2 — a worktree-isolated agent's own `.db` copy is NOT the main checkout's `.db`.** If a
fixing agent needs a schema change (new column) to actually test its own fix, it'll correctly apply
that to *its own* copy — but the main checkout (and therefore the orchestrating session's own dev
server) won't have that column until someone applies the same surgical `ALTER TABLE` by hand after
merging. Checked for this proactively this time by restarting the main server right after each merge
and watching for exactly this class of error, rather than assuming "lint + tsc clean" meant the DB was
fine too.

**Still true from before, reconfirmed**: `DATABASE_PUSH=true` on this DB proposes dropping unrelated
tables due to known pre-existing drift (see the Gemini-key-field entry) — the surgical-`ALTER TABLE`-
via-`libsql` script pattern (`scripts/add-*-column.mjs`) is the correct move every time a fixing agent
or future session needs one additive column on this particular local database.

---

## 2026-10-24 (2) — Found & fixed: `access.read: () => false` hides a field from the admin UI entirely

**Load-bearing Payload fact, worth remembering for any future secret-style field**: in Payload 3.x,
a field with `access: { read: () => false }` is not just "value hidden" — `@payloadcms/ui`'s
`RenderFields` component skips rendering the field's input **completely** for everyone, including the
field's own intended editor, because the Admin UI's edit-view data-fetch respects real field-level
access control (unlike the Local API, whose default `overrideAccess: true` is a separate thing). This
had been silently broken for `smtpPass`, `resendApiKey`, and `googleTranslateApiKey` since Phase 1/3 —
nobody could ever actually type a new value into those fields via the admin form; `set-translate-key.mjs`
existed as an unexplained workaround for exactly this. Only surfaced now because the user tried the new
Gemini field through the UI and it should have been a fairly quick find if the UI had been exercised
by a human earlier (it hadn't been).

**The correct pattern for a secret that must be admin-UI-settable but never readable back** (now applied
to all 4 fields in `src/globals/Settings.ts`): keep `access.read` permissive for authenticated users
(so the field renders), and instead null the VALUE in an `afterRead` field hook, conditioned on the
hook's `overrideAccess` argument — `null` when access control is in effect (Admin UI render,
REST/GraphQL), the real value when `overrideAccess` is true (Payload Local API's default for trusted
server-side code, e.g. reading the key to actually call an external API). **Gotcha inside the gotcha**:
a hook returning `undefined` means "leave the value as-is" in Payload, not "clear it" — must return
`null` to actually blank a value. Caught this exact mistake live (a real `GET` echoed a just-set test
value back in plaintext) before anything but a deliberately-fake string was ever exposed.

**This sandbox cannot launch a real browser** — Playwright's Chromium doesn't support
`ubuntu26.04-x64` (too new for Playwright 1.56.1's platform table) and the headless shell needs system
libs (`libnspr4`, `libnss3`, `libasound2t64`) installable only via `sudo`, which isn't available here.
`PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 npx playwright install chromium` gets the binary
downloaded, but it still can't launch without those libs. For any future "does this actually render"
question in this environment, the fallback is reading Payload/React's actual installed source +
inspecting the server-rendered page's embedded form-state JSON — not guessing from field config alone.

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
