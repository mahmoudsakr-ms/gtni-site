import { routing } from '@/i18n/routing'

/**
 * Builds `alternates.canonical` + `alternates.languages` for a page, given its
 * locale-independent path (e.g. `/about-gtni`, or `/` for the homepage).
 * English (the default locale) stays unprefixed; other locales are prefixed
 * (`/ar/about-gtni`), matching the `localePrefix: 'as-needed'` routing config.
 */
export function buildLocaleAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {}

  for (const l of routing.locales) {
    const prefix = l === routing.defaultLocale ? '' : `/${l}`
    languages[l] = path === '/' ? prefix || '/' : `${prefix}${path}`
  }

  languages['x-default'] = languages[routing.defaultLocale]

  return {
    canonical: languages[locale] ?? languages[routing.defaultLocale],
    languages,
  }
}
