/**
 * `withPayload()` in next.config.mjs reads its OWN `NEXT_PUBLIC_BASE_PATH` env
 * var to set `nextConfig.basePath`, then derives `process.env.NEXT_BASE_PATH`
 * from that (and whitelists it for the client bundle via Next's `env` config
 * key) -- that derived variable is what Payload's own URL-building (admin
 * routes, its REST API, upload file URLs -- see formatAdminURL /
 * generateFilePathOrURL in payload's source) actually reads internally.
 * Reading the SAME derived variable here (not re-reading NEXT_PUBLIC_BASE_PATH
 * directly) keeps every consumer -- server utilities, and client components
 * that do their own `fetch('/api/...')` instead of going through Payload's
 * REST client -- in sync with what Payload itself resolved, automatically
 * available in the browser with no extra plumbing.
 */
export const BASE_PATH = process.env.NEXT_BASE_PATH || ''

export function getPublicBaseUrl(): string {
  const origin = process.env.NEXT_PUBLIC_SERVER_URL || 'https://gtni.edu.eg'
  return `${origin}${BASE_PATH}`
}
