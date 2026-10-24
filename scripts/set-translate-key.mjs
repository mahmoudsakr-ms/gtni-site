/**
 * LOCAL helper: write the Google Cloud Translation API key into the `settings`
 * global of the local dev DB, via Payload's Local API (so it's stored exactly the
 * way the admin UI would store it). Local only.
 *
 * Usage:  node scripts/set-translate-key.mjs "AIza...your-key..."
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const key = process.argv[2]
if (!key) {
  console.error('Usage: node scripts/set-translate-key.mjs "<google-translate-api-key>"')
  process.exit(1)
}

const payload = await getPayload({ config })
await payload.updateGlobal({ slug: 'settings', data: { googleTranslateApiKey: key } })
const check = await payload.findGlobal({ slug: 'settings', overrideAccess: true, showHiddenFields: true })
console.log('googleTranslateApiKey now set:', check.googleTranslateApiKey ? `${String(check.googleTranslateApiKey).slice(0, 6)}… (${String(check.googleTranslateApiKey).length} chars)` : '(empty!)')
process.exit(0)
