import { defineRouting } from 'next-intl/routing'

// English keeps its exact current unprefixed URLs (e.g. /about-gtni) -- no disruption
// to existing SEO/backlinks. Arabic gets new prefixed URLs (e.g. /ar/about-gtni).
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
