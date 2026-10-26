import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Keep this list identical to the `securityHeaders` array in next.config.mjs's headers()
// function -- duplicated rather than shared because next.config.mjs is loaded by Node
// directly (no TypeScript) before it can import from this file.
//
// Belt-and-suspenders fix: next.config.mjs's headers() already covers every path
// (including this one, via an explicit source for the exact basePath root), but a request
// for the basePath root specifically goes through next-intl's locale rewrite here, and in
// at least one real production-like test (a genuine `next build` + `next start`, matching
// deployed env vars exactly, bypassing nginx), that exact request came back missing 3 of
// the 5 headers even though next.config's own routes-manifest had the correct rule for it
// -- not reproducible from this sandbox with the same build, so the precise mechanism
// wasn't pinned down, but setting the headers directly on every response this middleware
// produces guarantees they're present regardless of whatever next.config-level subtlety
// caused that gap.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export const config = {
  // Skip the Payload admin panel, all API routes (both frontend and Payload's own),
  // Next internals, and any request for a file with an extension (static assets).
  //
  // The explicit '/' entry matters specifically under `basePath`: Next strips
  // the configured basePath from the pathname before matching, so a request
  // for exactly the basePath root (e.g. '/new') arrives here as an EMPTY
  // string, not '/' -- the regex below requires a literal leading '/', so it
  // can never match that empty string, and middleware (and therefore the
  // locale rewrite) was silently skipped for the site's own homepage under a
  // basePath (confirmed: every other path, including explicit locale
  // prefixes and real sub-pages, matched and worked correctly -- only the
  // bare root didn't). Without `basePath` set, this is a no-op: '/' already
  // matches the regex pattern on its own.
  matcher: ['/', '/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
