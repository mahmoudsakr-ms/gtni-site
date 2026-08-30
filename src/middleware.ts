import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip the Payload admin panel, all API routes (both frontend and Payload's own),
  // Next internals, and any request for a file with an extension (static assets).
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
