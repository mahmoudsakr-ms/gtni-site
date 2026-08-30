import { getRequestConfig } from 'next-intl/server'
import { routing, type AppLocale } from './routing'

// No message catalog: all real content comes from Payload CMS (see Phase 2/3 of
// PLAN_SECURITY_I18N.md), not next-intl message files. This config exists only so
// next-intl's routing/middleware/NextIntlClientProvider machinery has a locale to
// resolve per request.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: {},
  }
})
