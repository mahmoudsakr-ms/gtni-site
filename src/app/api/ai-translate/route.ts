import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { translateDocument, TranslationApiError } from '@/utilities/translateContent'
import type { Setting } from '@/payload-types'

// Only these globals carry `localized: true` fields (see Phase 2 in PLAN_SECURITY_I18N.md).
// The NewsEvents *collection* (individual articles) and `settings` are deliberately excluded.
const TRANSLATABLE_GLOBAL_SLUGS = [
  'header',
  'footer',
  'home',
  'about-gtni',
  'admission',
  'courses',
  'nursing-programs',
  'scholarships',
  'student-services',
  'vacancies',
  'news-events-global',
]

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { globalSlug, targetLocales } = (body || {}) as {
    globalSlug?: unknown
    targetLocales?: unknown
  }

  if (typeof globalSlug !== 'string' || !TRANSLATABLE_GLOBAL_SLUGS.includes(globalSlug)) {
    return NextResponse.json(
      { error: `globalSlug must be one of: ${TRANSLATABLE_GLOBAL_SLUGS.join(', ')}` },
      { status: 400 },
    )
  }

  if (
    !Array.isArray(targetLocales) ||
    targetLocales.length === 0 ||
    !targetLocales.every((l) => typeof l === 'string')
  ) {
    return NextResponse.json({ error: 'targetLocales must be a non-empty array of strings.' }, { status: 400 })
  }

  const localeConfig = payload.config.localization
  if (!localeConfig) {
    return NextResponse.json({ error: 'Localization is not configured.' }, { status: 500 })
  }

  const defaultLocale =
    typeof localeConfig.defaultLocale === 'string' ? localeConfig.defaultLocale : 'en'

  const validLocaleCodes = localeConfig.locales.map((l) => (typeof l === 'string' ? l : l.code))
  const invalidLocales = targetLocales.filter(
    (l) => !validLocaleCodes.includes(l as string) || l === defaultLocale,
  )
  if (invalidLocales.length > 0) {
    return NextResponse.json(
      { error: `Invalid target locale(s): ${invalidLocales.join(', ')}` },
      { status: 400 },
    )
  }

  // Local API bypasses field-level `access.read: () => false` -- this is the one place
  // allowed to read the real translation API keys, server-side only, never returned
  // to a client.
  const settings: Setting = await payload.findGlobal({ slug: 'settings' })

  // TRANSLATE_PROVIDER picks the provider (env-gated local-testing switch, see
  // src/utilities/translateContent.ts); each provider resolves its own key.
  const envProvider = process.env.TRANSLATE_PROVIDER
  const isFreeProvider = envProvider === 'free' // MyMemory: keyless, no key to resolve.
  const isGeminiProvider = envProvider === 'gemini'

  const apiKey = isGeminiProvider
    ? settings.geminiApiKey || process.env.GEMINI_API_KEY || undefined
    : settings.googleTranslateApiKey || undefined

  if (!isFreeProvider && !apiKey) {
    return NextResponse.json(
      {
        error: isGeminiProvider
          ? 'No Gemini API key configured. Add one under Settings > AI Translation (Gemini — testing).'
          : 'No Google Translate API key configured. Add one under Settings > AI Translation (Google Translate).',
      },
      { status: 400 },
    )
  }

  const globalConfig = payload.config.globals.find((g) => g.slug === globalSlug)
  if (!globalConfig) {
    return NextResponse.json({ error: `Unknown global: ${globalSlug}` }, { status: 400 })
  }

  const sourceDoc = await payload.findGlobal({
    slug: globalSlug as never,
    locale: defaultLocale as never,
    depth: 0,
  })

  const results: Record<string, { fieldsTranslated: number } | { error: string }> = {}

  for (const targetLocale of targetLocales as string[]) {
    try {
      const { data: translatedData, fieldsTranslated } = await translateDocument(
        globalConfig.fields,
        sourceDoc as Record<string, unknown>,
        targetLocale,
        defaultLocale,
        apiKey,
      )

      await payload.updateGlobal({
        slug: globalSlug as never,
        locale: targetLocale as never,
        draft: true,
        data: translatedData as never,
      })

      results[targetLocale] = { fieldsTranslated }
    } catch (error) {
      const message =
        error instanceof TranslationApiError || error instanceof Error
          ? error.message
          : 'Unknown error during translation.'
      results[targetLocale] = { error: message }
    }
  }

  return NextResponse.json({ globalSlug, results })
}
