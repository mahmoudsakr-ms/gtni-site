import type { Field } from 'payload'

/**
 * AI-assisted translation via the Google Cloud Translation API ("Basic" / v2 --
 * a plain API key is enough, no service account or GCP project wiring needed).
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
 * Note: unlike an LLM-based translator, Cloud Translation is a literal machine
 * translation engine with no steerable "tone" or "preserve this proper noun"
 * instruction -- in practice short institutional acronyms like "GTNI" are left
 * as-is by NMT engines since they're not recognized words, but this hasn't been
 * verified against a real API key yet. Worth a spot-check once a key is added.
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
  apiKey: string,
): Promise<{ data: Record<string, unknown>; fieldsTranslated: number }> {
  const clonedData: Record<string, unknown> = {}
  const refs: TranslatableRef[] = []

  collectTranslatableRefs(fields, sourceData, clonedData, refs)

  if (refs.length === 0) {
    return { data: clonedData, fieldsTranslated: 0 }
  }

  const originals = refs.map((r) => r.getOriginal())
  const translated = await translateStringsWithGoogle(
    originals,
    targetLocaleCode,
    sourceLocaleCode,
    apiKey,
  )

  refs.forEach((ref, i) => ref.setTranslated(translated[i]))

  return { data: clonedData, fieldsTranslated: refs.length }
}
