# CLAUDE.md — GTNI Website

This file gives Claude (and any engineer) the context needed to work on this repo without re-discovering it from scratch each session.

## Project Overview

- **Name**: Gouna Technical Nursing Institute (GTNI) website — production domain `gtni.edu.eg`
- **Type**: Full-stack Next.js 15 (App Router) site with an embedded **Payload CMS 3** admin/backend, single codebase serves both.
- **Purpose**: Public marketing/informational site (about, admission, courses, nursing programs, scholarships, student services, vacancies, news & events) fully content-managed through the Payload admin panel at `/admin`.
- **Repo**: https://github.com/mahmoudsakr-ms/gtni-site (single `main` branch)
- **Production**: deployed on a VPS via PM2 + Nginx (see `README_DEPLOY.md`, bilingual AR/EN, and `STACK.md` for the full reverse-engineered production reference — read `STACK.md` first, it documents the live deployment in detail).

## Tech Stack (see `STACK.md` for full detail)

Next.js 15.4 (React 19) · Payload CMS 3.74 · SQLite (`@payloadcms/db-sqlite` + libsql) · Lexical rich text · Tailwind CSS 4 · shadcn/ui (new-york) + Radix · Framer Motion · Resend/Nodemailer email · sharp · TypeScript 5.7 · Vitest + Playwright · pnpm.

## Local Development Setup (already done in this environment)

This sandbox has no system Node/pnpm and no sudo. Setup performed:

1. Node v22.22.0 installed standalone (no root) to `~/.local/node`, added to `PATH` via `~/.bashrc`.
2. pnpm 10.17.1 activated via corepack (`corepack prepare pnpm@10.17.1 --activate`) to match `package.json` engines.
3. Dependencies installed: `pnpm install --shamefully-hoist --node-linker=hoisted` (required flags for Payload — see `README_DEPLOY.md`).
4. `.env` created locally (gitignored, never committed) with a generated `PAYLOAD_SECRET`, `DATABASE_URL=file:./.db`, and `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`.
5. **Schema bootstrap gotcha**: `src/migrations/` starts mid-project (its first migration *renames* `student_life` → `student_services`, assuming that table already exists). There is no "create base schema" migration in version control, so running `pnpm run payload migrate` against a brand-new empty database fails immediately (`no such table: student_life`).
   - **Fix applied**: `src/payload.config.ts` now reads `push: process.env.DATABASE_PUSH === 'true'` instead of hardcoded `push: false`. Local `.env` sets `DATABASE_PUSH=true`, which makes the SQLite adapter auto-push the schema derived from the current collection/global definitions on dev server boot — no migration replay needed for a fresh local DB.
   - **Production must never set `DATABASE_PUSH=true`** — production already has real data and an established schema; it must keep using `push: false` and the explicit `pnpm run payload migrate` chain, exactly as documented in `STACK.md`/`README_DEPLOY.md`. Only the local `.env` has this flag.
   - If migration history is ever needed to match reality (e.g. before deploying schema changes), a proper baseline migration should be generated first — don't assume the current incremental chain is replayable from empty.

### Commands

```bash
pnpm run dev          # start dev server (localhost:3000), auto-reload
pnpm run devsafe      # same, but clears .next first
pnpm run build        # production build
pnpm run start        # start production server (after build)
pnpm run lint         # ESLint
pnpm run test         # test:int (Vitest) + test:e2e (Playwright)
pnpm run generate:types      # regenerate src/payload-types.ts after schema changes
pnpm run generate:importmap  # regenerate Payload admin import map after adding custom admin components
pnpm run payload      # Payload CLI passthrough (e.g. `pnpm run payload migrate:create`)
```

Verified working in this environment: `pnpm run dev` serves `/` and all frontend routes (about-gtni, admission, courses, news-events, nursing-programs, scholarships, student-services, vacancies) with HTTP 200, and `/admin` loads. First run against `/admin` will prompt to create the first admin user (no seed data/users exist in a fresh local DB).

## Navigating the Codebase

**Don't re-read the whole codebase for a feature request.** Check `CODEMAP.md` first — it indexes every file under `src/` (routes, collections, globals, components, utilities, admin customizations) with one-line purposes and a "how to find things" cheat-sheet for common edit scenarios (change homepage hero, edit nav, add a collection field, etc).

## Session Continuity

- `PROGRESS.md` — running log of what's been built/changed, in chronological order. Update it at the end of a work session.
- `MEMORY.md` — condensed carry-over notes between chat sessions (decisions made, gotchas hit, open questions) so the user doesn't have to re-explain context every new conversation. Update it at the end of a session.
- `CODEMAP.md` — structural index of the codebase (see above). Update it whenever files are added/removed/significantly restructured.

## ⚠️ Standing Rules for All Edits

- **Non-destructive edits.** Prefer additive schema/config changes. Never drop existing data, remove working functionality, or make an irreversible change without an explicit, separate, confirmed step.
- **Rollback checkpoints.** Before any risky change (schema migration, access-control change, routing change), ensure the working tree is committed clean first — that commit *is* the rollback checkpoint (`git revert`/`git reset` back to it if something breaks). Don't stack multiple unrelated risky changes into one uncommitted working tree.
- There is a large pending multi-phase plan saved at `PLAN_SECURITY_I18N.md` (security hardening + CMS localization + Gemini AI translation) — read it before starting related work; it documents phase-by-phase sequencing built around these two rules.

## ⚠️ Permanent Workflow — Required After Every Feature/Change

**These four steps are mandatory after completing any feature, fix, or non-trivial edit — do not skip them and do not ask whether to do them, just do them (pausing only for the explicit user confirmation step 3 requires):**

1. **Security review as a 10x cybersecurity expert.** Review the diff for: injection (SQL/NoSQL/command/XSS), auth/access-control gaps (Payload `access` functions on collections/globals/fields), secrets/credentials committed or logged, unsafe deserialization, SSRF, path traversal, missing input validation at boundaries (API routes, server actions, webhook/revalidate endpoints), unsafe use of `dangerouslySetInnerHTML` or raw HTML from CMS content, and dependency risk for anything newly added. Treat this with the same rigor as the `/security-review` skill.
2. **Verify the code actually works.** Don't just typecheck — run it: `pnpm run lint`, relevant tests, and actually exercise the changed page/endpoint (dev server + curl/browser, or Playwright for e2e-relevant flows). If it's a UI change, actually load it in a browser and check the golden path plus obvious edge cases.
3. **Commit and push to the GitHub repo** (`https://github.com/mahmoudsakr-ms/gtni-site`, `main` branch) once verified, to avoid local/remote drift. Confirm with the user before pushing (per standing safety practice) unless they've explicitly pre-authorized autonomous pushes for the session. Never force-push. Never commit `.env`, `.db`, or anything already gitignored.
4. **Update `PROGRESS.md` and `MEMORY.md`** with what changed and any decisions/gotchas worth remembering next session, so context isn't lost between conversations.

## Notes / Constraints

- No sudo / root in this dev environment — any tooling needs must be installed user-locally (see Node/pnpm setup above as the pattern).
- SQLite DB file (`.db`) and `public/media` uploads are the persistent state in production — never delete/overwrite them; they are gitignored (correctly) and must never be committed.
- `next.config.mjs` carries a large set of permanent SEO redirects from a legacy site structure — check it before renaming/removing routes.
- Email adapter auto-switches to Resend if `RESEND_API_KEY` is set, else falls back to SMTP/Nodemailer — local dev without either will log a harmless "Missing credentials for LOGIN" warning on boot; this does not block the app.
