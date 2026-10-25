'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Languages, Loader2 } from 'lucide-react'
import { BASE_PATH } from '@/utilities/publicUrl'

// Kept in sync with the `localization.locales` list in src/payload.config.ts, minus the
// default locale (English is the translation source, never a translation target).
const TARGET_LOCALES: { code: string; label: string }[] = [{ code: 'ar', label: 'Arabic' }]

type TranslateResult = Record<string, { fieldsTranslated: number } | { error: string }>

export const TranslateButton: React.FC = () => {
  const { globalSlug } = useDocumentInfo()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TranslateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!globalSlug) return null

  const anySelected = Object.values(selected).some(Boolean)

  const handleTranslate = async () => {
    const targetLocales = TARGET_LOCALES.filter((l) => selected[l.code]).map((l) => l.code)
    if (targetLocales.length === 0) return

    // UX-19: this always overwrites whatever draft already exists for the
    // target locale(s) -- confirm before doing that instead of firing silently.
    const localeLabels = TARGET_LOCALES.filter((l) => selected[l.code])
      .map((l) => l.label)
      .join(', ')
    const confirmed = window.confirm(
      `This will overwrite any existing ${localeLabels} draft for this page with a fresh AI translation. Continue?`,
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${BASE_PATH}/api/ai-translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ globalSlug, targetLocales }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`)
      } else {
        setResult(json.results as TranslateResult)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-4 p-4 rounded-xl border border-(--theme-elevation-200) bg-(--theme-elevation-50)/30">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-primary" />
        <span className="font-bold text-sm uppercase tracking-wide text-(--theme-elevation-800)">
          Translate with AI
        </span>
      </div>
      <p className="text-xs text-(--theme-elevation-500) mb-3">
        Translates the current English content into the selected language(s) using AI, and saves
        the result as a draft for that language — review it, then Publish to make it live.
        Requires an API key configured under Settings &gt; AI Translation (Google Translate) or
        AI Translation (Gemini — testing), depending on which provider the server is set to use.
      </p>
      <div className="flex flex-wrap items-center gap-4 mb-3">
        {TARGET_LOCALES.map((locale) => (
          <label key={locale.code} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(selected[locale.code])}
              onChange={(e) => setSelected((s) => ({ ...s, [locale.code]: e.target.checked }))}
              disabled={loading}
            />
            {locale.label}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={handleTranslate}
        disabled={!anySelected || loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
        {loading ? 'Translating…' : 'Translate Selected'}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 space-y-1">
          {Object.entries(result).map(([locale, outcome]) => (
            <p key={locale} className="text-sm">
              <strong>{locale}:</strong>{' '}
              {'error' in outcome ? (
                <span className="text-red-600">{outcome.error}</span>
              ) : (
                <span className="text-green-600">
                  Translated {outcome.fieldsTranslated} field(s), saved as draft. Switch locale to
                  review, then Publish.
                </span>
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default TranslateButton
