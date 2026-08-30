import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware Link/router/pathname helpers, matching the `routing` config above
// (default locale unprefixed, others prefixed).
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
