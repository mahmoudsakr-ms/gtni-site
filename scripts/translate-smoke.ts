/**
 * LOCAL smoke check for the keyless (MyMemory) translation path.
 * Verifies outbound connectivity, response parsing, long-string chunking, and
 * acronym preservation before exercising the admin-portal button.
 *
 * Run: ./node_modules/.bin/payload run scripts/translate-smoke.ts
 */
import { translateStringsFree } from '../src/utilities/translateContent'

const samples = [
  'Gouna Technical Nursing Institute',
  'Admission Requirements',
  'GTNI empowers youth to challenge themselves academically, to serve and to lead, and to promote improved health within their communities and to contribute to society within Egypt. This is a deliberately long sentence intended to exceed the four-hundred-and-fifty character segment limit so that the chunking logic in splitForTranslation is exercised end to end, including the rejoining of the translated pieces back into a single string that the field walker can splice into the cloned document tree without disturbing any of the surrounding Lexical formatting nodes.',
]

const out = await translateStringsFree(samples, 'ar', 'en')
for (let i = 0; i < samples.length; i++) {
  console.log('\nEN:', samples[i].slice(0, 120) + (samples[i].length > 120 ? '…' : ''))
  console.log('AR:', out[i])
  console.log('GTNI preserved:', /GTNI/i.test(samples[i]) ? out[i].includes('GTNI') : 'n/a')
}
process.exit(0)
