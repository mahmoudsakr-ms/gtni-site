import type { GlobalBeforeOperationHook, GlobalConfig, PayloadRequest } from 'payload'

/**
 * SEC-H1 fix: unpublished draft content on page globals is readable by anyone,
 * unauthenticated, via `GET /api/globals/<slug>?draft=true` (and the equivalent
 * GraphQL `draft: true` argument / Local API `draft: true` option).
 *
 * All 11 page globals declare `access: { read: () => true }` so the public site
 * can render published content with no login, and `versions: { drafts: true }`
 * so editors can save work-in-progress without publishing. The bug: Payload's
 * global `findOne` operation (`payload/dist/globals/operations/findOne.js`)
 * checks `access.read` only to decide whether the request may read the global
 * *at all* -- it does not separately gate whether the `draft` flag is honored.
 * Since `access.read` always returns `true`, an anonymous caller asking for
 * `?draft=true` gets the latest saved draft handed back verbatim.
 *
 * Why not the more obvious `beforeOperation` fix that forces `args.draft = false`?
 * Verified empirically (and in the Payload source) that it does NOT work: inside
 * `findOneOperation`, `draft` is destructured out of `args` into a local
 * `replaceWithVersion` constant *before* any `beforeOperation` hook runs, so
 * mutating `args.draft` inside the hook has no effect on whether the draft is
 * substituted later in the same function. A test against this repo's local
 * Payload 3.74.0 install confirmed the leak persists unchanged with that
 * approach wired up.
 *
 * The fix that actually works combines two hook points that *do* run in the
 * right order, and -- unlike `req.query.draft` -- is correct for all three
 * entry points (REST, GraphQL, Local API all funnel through the same
 * `findOneOperation`, but only REST puts the flag on `req.query`):
 *
 *   1. `beforeOperation` runs first and still has the *original*, undestructured
 *      `args.draft` available (reading it is fine; only mutating-then-expecting-
 *      it-to-stick doesn't work). It stashes that intent onto `req.context`,
 *      which both the REST, GraphQL, and Local API paths share consistently.
 *   2. `access.read` runs next, after the destructuring, but still before the
 *      draft-replacement branch. Returning `false` from it makes Payload's own
 *      `executeAccess` throw a `Forbidden` (403) immediately, so the draft
 *      branch is never reached for an unauthenticated caller.
 *
 * Authenticated requests (admin panel, logged-in editors) are completely
 * unaffected -- `access.read` returns `true` immediately whenever `req.user`
 * is present, exactly as the original `() => true` did.
 */
export const withDraftProtection = (global: GlobalConfig): GlobalConfig => {
  const existingRead = global.access?.read
  const existingBeforeOperation = global.hooks?.beforeOperation || []

  return {
    ...global,
    access: {
      ...global.access,
      read: async (accessArgs) => {
        const { req } = accessArgs
        if (!req.user && req.context?.draftRequested) {
          return false
        }
        if (typeof existingRead === 'function') {
          return existingRead(accessArgs)
        }
        return true
      },
    },
    hooks: {
      ...global.hooks,
      beforeOperation: [
        ...existingBeforeOperation,
        (({ args, operation, req }: { args?: { draft?: boolean }; operation: string; req: PayloadRequest }) => {
          if (operation === 'read') {
            req.context = req.context || {}
            req.context.draftRequested = Boolean(args?.draft)
          }
          return args
        }) as GlobalBeforeOperationHook,
      ],
    },
  }
}
