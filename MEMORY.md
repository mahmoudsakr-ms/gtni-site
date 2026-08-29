# MEMORY.md — Session Carry-Over Notes

Purpose: condensed notes between chat sessions on this project, so context/decisions don't need to be re-explained each time. Append a new dated entry at the top after each session. Keep entries short — decisions, gotchas, preferences, not a transcript.

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
