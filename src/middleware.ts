import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

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
