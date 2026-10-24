import type { Field } from 'payload'

/**
 * AI-assisted translation.
 *
 * PRODUCTION path: the Google Cloud Translation API ("Basic" / v2 -- a plain API
 * key is enough, no service account or GCP project wiring needed). This is the
 * default and is used whenever `process.env.TRANSLATE_PROVIDER` is unset.
 *
 * LOCAL-TESTING paths (opt-in via env only, never enable in production):
 *   - `TRANSLATE_PROVIDER=free`   -> MyMemory (https://mymemory.translated.net),
 *     keyless. Low anonymous quota (~1000 words / rolling window per IP); set
 *     `MYMEMORY_EMAIL` for a higher free quota. See `translateStringsFree`.
 *   - `TRANSLATE_PROVIDER=gemini` -> Google Gemini via the AI Studio free tier
 *     (free key, no billing). Key from `GEMINI_API_KEY`. One batched call per
 *     document, preserves "GTNI". See `translateStringsWithGemini`.
 *
 * The field walker below is schema-driven: it reads the SAME `localized: true`
 * flags set on each global's field config (see src/globals/*.ts) to decide what
 * to translate, rather than maintaining a separate hand-written list per global.
 * Add a new localized field to a global and this picks it up automatically.
 *
 * It also always clones the *source* document's structure (including array/block
 * row `id`s) and only overwrites translatable leaf values -- this is deliberate:
 * updating a localized array field without preserving the existing row `id` makes
 * Payload treat it as a new row, silently orphaning the other locale's data for
 * that position (found and confirmed during Phase 2 testing).
 *
 * Note: both providers are literal machine translation engines with no steerable
 * "tone" or "preserve this proper noun" instruction -- in practice short
 * institutional acronyms like "GTNI" are left as-is by NMT engines since they're
 * not recognized words (confirmed for MyMemory).
 */

export interface TranslatableRef {
  getOriginal: () => string
  setTranslated: (value: string) => void
}

/** Recursively walks a Lexical rich-text value, collecting refs to its leaf text nodes. */
function collectLexicalLeafRefs(node: unknown, refs: TranslatableRef[]): void {
  if (!node) return

  if (Array.isArray(node)) {
    for (const child of node) collectLexicalLeafRefs(child, refs)
    return
  }

  if (typeof node !== 'object') return
  const obj = node as Record<string, unknown>

  if ('root' in obj) {
    collectLexicalLeafRefs(obj.root, refs)
    return
  }

  if (obj.type === 'text' && typeof obj.text === 'string' && obj.text.trim().length > 0) {
    const original = obj.text
    refs.push({
      getOriginal: () => original,
      setTranslated: (value) => {
        obj.text = value
      },
    })
  }

  if (Array.isArray(obj.children)) {
    collectLexicalLeafRefs(obj.children, refs)
  }
}

/**
 * Walks a Payload field schema alongside a source data object, building a cloned
 * data object with translatable leaf values collected into `refs` (to be filled in
 * once translations come back) and everything else copied through untouched.
 */
export function collectTranslatableRefs(
  fields: Field[],
  sourceData: Record<string, unknown> | null | undefined,
  clonedData: Record<string, unknown>,
  refs: TranslatableRef[],
): void {
  const src = sourceData || {}

  for (const field of fields) {
    if (!('type' in field)) continue

    switch (field.type) {
      case 'row':
      case 'collapsible': {
        collectTranslatableRefs(field.fields, src, clonedData, refs)
        break
      }
      case 'tabs': {
        for (const tab of field.tabs) {
          collectTranslatableRefs(tab.fields, src, clonedData, refs)
        }
        break
      }
      case 'group': {
        const name = 'name' in field ? field.name : undefined
        if (!name) break
        const srcVal = (src[name] as Record<string, unknown>) || {}
        const cloned = (clonedData[name] as Record<string, unknown>) || {}
        clonedData[name] = cloned
        collectTranslatableRefs(field.fields, srcVal, cloned, refs)
        break
      }
      case 'array': {
        const name = 'name' in field ? field.name : undefined
        if (!name) break
        const srcArr = Array.isArray(src[name]) ? (src[name] as Record<string, unknown>[]) : []
        const clonedArr = srcArr.map((row) => structuredClone(row))
        clonedData[name] = clonedArr
        srcArr.forEach((row, i) => {
          collectTranslatableRefs(field.fields, row, clonedArr[i], refs)
        })
        break
      }
      case 'blocks': {
        const name = 'name' in field ? field.name : undefined
        if (!name) break
        const srcArr = Array.isArray(src[name]) ? (src[name] as Record<string, unknown>[]) : []
        const clonedArr = srcArr.map((row) => structuredClone(row))
        clonedData[name] = clonedArr
        srcArr.forEach((row, i) => {
          const blockType = row.blockType as string | undefined
          const blockDef = field.blocks.find((b) => b.slug === blockType)
          if (blockDef) {
            collectTranslatableRefs(blockDef.fields, row, clonedArr[i], refs)
          }
        })
        break
      }
      case 'text':
      case 'textarea': {
        if (!field.localized) break
        const name = 'name' in field ? field.name : undefined
        if (!name) break
        const original = src[name]
        if (typeof original !== 'string' || !original.trim()) break
        clonedData[name] = original
        refs.push({
          getOriginal: () => original,
          setTranslated: (value) => {
            clonedData[name] = value
          },
        })
        break
      }
      case 'richText': {
        if (!field.localized) break
        const name = 'name' in field ? field.name : undefined
        if (!name) break
        const original = src[name]
        if (!original) break
        const cloned = structuredClone(original)
        clonedData[name] = cloned
        collectLexicalLeafRefs(cloned, refs)
        break
      }
      default:
        // Non-translatable field types (select, checkbox, date, number, upload,
        // relationship, email, ui, point, etc.) -- nothing to walk into.
        break
    }
  }
}

export class TranslationApiError extends Error {}

/**
 * Sends a batch of source strings to the Google Cloud Translation API ("Basic" v2)
 * and returns their translations, in the same order. Batching an entire document's
 * strings into one call keeps API usage low.
 */
export async function translateStringsWithGoogle(
  texts: string[],
  targetLocaleCode: string,
  sourceLocaleCode: string,
  apiKey: string,
): Promise<string[]> {
  if (texts.length === 0) return []

  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: sourceLocaleCode,
        target: targetLocaleCode,
        format: 'text',
      }),
    })
  } catch (e) {
    // Logged server-side only (never sent to the client) since a raw fetch-level
    // exception can sometimes include the request URL, and therefore the API key.
    console.error('Google Translate fetch failed:', e)
    throw new TranslationApiError('Network error contacting the Google Translate API.')
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new TranslationApiError(
      `Google Translate API request failed (${response.status}): ${errText.slice(0, 500)}`,
    )
  }

  const json = (await response.json()) as {
    data?: { translations?: { translatedText?: string }[] }
  }

  const translations = json.data?.translations
  if (!Array.isArray(translations) || translations.length !== texts.length) {
    throw new TranslationApiError(
      `Google Translate API returned ${Array.isArray(translations) ? translations.length : 'no'} translations, expected ${texts.length}.`,
    )
  }

  return translations.map((t) => t.translatedText || '')
}

// ---------------------------------------------------------------------------
// Keyless local-testing provider: MyMemory (https://mymemory.translated.net).
// Enabled only when TRANSLATE_PROVIDER=free. Not for production use.
// ---------------------------------------------------------------------------

const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get'
// MyMemory rejects a single `q` longer than 500 chars -- keep a margin.
const MYMEMORY_MAX_SEGMENT = 450

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Splits a long string into <=MYMEMORY_MAX_SEGMENT chunks on sentence, then word, boundaries. */
function splitForTranslation(text: string): string[] {
  if (text.length <= MYMEMORY_MAX_SEGMENT) return [text]
  const sentences = text.split(/(?<=[.!?…،؛\n])\s+/)
  const chunks: string[] = []
  let cur = ''
  const flush = () => {
    if (cur.trim()) chunks.push(cur.trim())
    cur = ''
  }
  for (const sentence of sentences) {
    let piece = sentence
    while (piece.length > MYMEMORY_MAX_SEGMENT) {
      flush()
      let cut = piece.lastIndexOf(' ', MYMEMORY_MAX_SEGMENT)
      if (cut <= 0) cut = MYMEMORY_MAX_SEGMENT
      chunks.push(piece.slice(0, cut).trim())
      piece = piece.slice(cut).trimStart()
    }
    if ((cur + ' ' + piece).trim().length > MYMEMORY_MAX_SEGMENT) flush()
    cur = cur ? `${cur} ${piece}` : piece
  }
  flush()
  return chunks.length ? chunks : [text.slice(0, MYMEMORY_MAX_SEGMENT)]
}

/** Daily free allowance is gone -- retrying will not help, abort the batch. */
class TranslationQuotaError extends TranslationApiError {}
/** Momentary throttle (HTTP 429) -- back off and retry. */
class TranslationRateLimitError extends TranslationApiError {}

async function translateSegmentWithMyMemory(
  segment: string,
  targetLocaleCode: string,
  sourceLocaleCode: string,
): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL
  const url =
    `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(segment)}` +
    `&langpair=${encodeURIComponent(sourceLocaleCode)}|${encodeURIComponent(targetLocaleCode)}` +
    (email ? `&de=${encodeURIComponent(email)}` : '')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  let response: Response
  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (e) {
    console.error('MyMemory fetch failed:', e)
    throw new TranslationApiError('Network error contacting the MyMemory translation service.')
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 429) throw new TranslationRateLimitError('MyMemory throttled (HTTP 429).')
  if (!response.ok) {
    throw new TranslationApiError(`MyMemory request failed (${response.status}).`)
  }

  const json = (await response.json().catch(() => null)) as {
    responseStatus?: number | string
    responseData?: { translatedText?: string }
  } | null

  const translated = json?.responseData?.translatedText
  const status = Number(json?.responseStatus)
  if (typeof translated !== 'string') {
    throw new TranslationApiError('MyMemory returned an unexpected response shape.')
  }
  if (/YOU USED ALL AVAILABLE FREE TRANSLATIONS/i.test(translated)) {
    throw new TranslationQuotaError(
      'MyMemory daily free quota exhausted for this IP. Try again tomorrow, set MYMEMORY_EMAIL in .env for a higher free quota, or use the paid Google key.',
    )
  }
  if (/MYMEMORY WARNING/i.test(translated)) {
    throw new TranslationRateLimitError(`MyMemory warning: ${translated.slice(0, 160)}`)
  }
  if (Number.isFinite(status) && status >= 400) {
    throw new TranslationApiError(`MyMemory error (status ${status}): ${translated.slice(0, 160)}`)
  }
  return translated
}

/**
 * Keyless batch translation via MyMemory, for local testing (TRANSLATE_PROVIDER=free).
 * Sequential, self-throttling. Long strings are split, translated per chunk, and
 * rejoined. Failure handling, in order of severity:
 *   - hard daily-quota response  -> abort the whole batch (retrying will not help)
 *   - many consecutive HTTP 429s -> abort with a "try later / set MYMEMORY_EMAIL" message
 *   - a single failed segment    -> keep the English original for it, keep going
 * so a throttled run still lands a partial Arabic draft quickly for human review
 * instead of grinding for many minutes.
 */
export async function translateStringsFree(
  texts: string[],
  targetLocaleCode: string,
  sourceLocaleCode: string,
): Promise<string[]> {
  const RATE_LIMIT_BACKOFF_MS = [1_500, 4_000, 10_000]
  const MAX_CONSECUTIVE_RATE_LIMITED_SEGMENTS = 6
  let interRequestDelay = 350
  let consecutiveRateLimited = 0

  const out: string[] = []
  for (const text of texts) {
    if (!text || !text.trim()) {
      out.push(text)
      continue
    }
    const segments = splitForTranslation(text)
    const translatedSegments: string[] = []
    for (const segment of segments) {
      let result: string | null = null
      let lastError: unknown = null
      let rateLimited = false
      for (let attempt = 0; attempt < RATE_LIMIT_BACKOFF_MS.length && result === null; attempt++) {
        try {
          result = await translateSegmentWithMyMemory(segment, targetLocaleCode, sourceLocaleCode)
        } catch (e) {
          lastError = e
          if (e instanceof TranslationQuotaError) throw e
          if (e instanceof TranslationRateLimitError) {
            rateLimited = true
            interRequestDelay = Math.min(interRequestDelay + 400, 3_000)
          }
          await sleep(RATE_LIMIT_BACKOFF_MS[attempt])
        }
      }
      if (result === null) {
        consecutiveRateLimited = rateLimited ? consecutiveRateLimited + 1 : 0
        if (consecutiveRateLimited >= MAX_CONSECUTIVE_RATE_LIMITED_SEGMENTS) {
          throw new TranslationRateLimitError(
            'MyMemory keeps throttling this IP. Try again in a few minutes, set MYMEMORY_EMAIL in .env for a higher free quota, or use the paid Google key.',
          )
        }
        console.warn(
          'translateStringsFree: keeping original for one segment after retries:',
          lastError instanceof Error ? lastError.message : lastError,
        )
        result = segment
      } else {
        consecutiveRateLimited = 0
      }
      translatedSegments.push(result)
      await sleep(interRequestDelay)
    }
    out.push(translatedSegments.join(' '))
  }
  return out
}

// ---------------------------------------------------------------------------
// Local-testing provider: Google Gemini via the AI Studio free tier
// (aistudio.google.com -- a free key, no credit card / billing). Enabled with
// TRANSLATE_PROVIDER=gemini; key from GEMINI_API_KEY, model from GEMINI_MODEL
// (default gemini-2.0-flash). One batched call per document. Not for production.
// ---------------------------------------------------------------------------

const LOCALE_LABELS: Record<string, string> = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
}

export async function translateStringsWithGemini(
  texts: string[],
  targetLocaleCode: string,
  apiKey: string,
  model = 'gemini-2.0-flash',
): Promise<string[]> {
  if (texts.length === 0) return []
  const targetLabel = LOCALE_LABELS[targetLocaleCode] || targetLocaleCode

  const prompt = `You are a professional translator for the website of the Gouna Technical Nursing Institute (GTNI), a nursing education institution in Egypt. Translate each of the following English strings into ${targetLabel}. Use a professional, formal tone appropriate for an educational institution's public website. Preserve the meaning and any punctuation exactly. Do not translate the institute's proper name "GTNI" or "Gouna Technical Nursing Institute" -- keep those as-is. Return ONLY a JSON array of the translated strings, in the exact same order, with no additional commentary.

Strings to translate (as a JSON array):
${JSON.stringify(texts)}`

  // Key sent via header, not `?key=`, so it never lands in an access log or a URL
  // echoed back inside an error message.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60_000)
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      }),
      signal: controller.signal,
    })
  } catch (e) {
    console.error('Gemini fetch failed:', e)
    throw new TranslationApiError('Network error contacting the Gemini API.')
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new TranslationApiError(`Gemini API request failed (${response.status}): ${errText.slice(0, 400)}`)
  }

  const json = (await response.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  } | null
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new TranslationApiError('Gemini API returned no translation content.')

  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new TranslationApiError('Gemini API returned invalid JSON.')
  }
  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new TranslationApiError(
      `Gemini API returned ${Array.isArray(parsed) ? parsed.length : 'a non-array'}, expected ${texts.length} items.`,
    )
  }
  return parsed.map((t) => (typeof t === 'string' ? t : String(t)))
}

/**
 * Dispatches to the configured translation provider:
 *   - unset (production default) -> Google Cloud Translation API v2 (paid key)
 *   - TRANSLATE_PROVIDER=free     -> MyMemory, keyless (local testing)
 *   - TRANSLATE_PROVIDER=gemini   -> Gemini AI Studio free tier (local testing)
 *
 * `apiKey` is resolved by the caller (route.ts) from the Settings global -- the
 * Google key for the default path, the Gemini key (Settings, falling back to
 * GEMINI_API_KEY) when TRANSLATE_PROVIDER=gemini -- so neither local-testing nor
 * production code here needs to read provider-specific env vars for the key itself.
 */
export async function translateStrings(
  texts: string[],
  targetLocaleCode: string,
  sourceLocaleCode: string,
  apiKey?: string,
): Promise<string[]> {
  const provider = process.env.TRANSLATE_PROVIDER

  if (provider === 'free') {
    return translateStringsFree(texts, targetLocaleCode, sourceLocaleCode)
  }
  if (provider === 'gemini') {
    if (!apiKey) {
      throw new TranslationApiError(
        'TRANSLATE_PROVIDER=gemini but no Gemini API key is configured (Settings > AI Translation (Gemini), or GEMINI_API_KEY env).',
      )
    }
    return translateStringsWithGemini(texts, targetLocaleCode, apiKey, process.env.GEMINI_MODEL || undefined)
  }
  if (!apiKey) {
    throw new TranslationApiError('No translation API key provided.')
  }
  return translateStringsWithGoogle(texts, targetLocaleCode, sourceLocaleCode, apiKey)
}

/**
 * Translates every `localized: true` field of a document (per the given field
 * schema) from its source (default-locale) values into one target locale.
 * Returns a new data object suitable for `payload.updateGlobal({ locale, data })`,
 * plus how many leaf strings were sent for translation.
 */
export async function translateDocument(
  fields: Field[],
  sourceData: Record<string, unknown>,
  targetLocaleCode: string,
  sourceLocaleCode: string,
  apiKey?: string,
): Promise<{ data: Record<string, unknown>; fieldsTranslated: number }> {
  const clonedData: Record<string, unknown> = {}
  const refs: TranslatableRef[] = []

  collectTranslatableRefs(fields, sourceData, clonedData, refs)

  if (refs.length === 0) {
    return { data: clonedData, fieldsTranslated: 0 }
  }

  const originals = refs.map((r) => r.getOriginal())
  const translated = await translateStrings(
    originals,
    targetLocaleCode,
    sourceLocaleCode,
    apiKey,
  )

  refs.forEach((ref, i) => ref.setTranslated(translated[i]))

  return { data: clonedData, fieldsTranslated: refs.length }
}
