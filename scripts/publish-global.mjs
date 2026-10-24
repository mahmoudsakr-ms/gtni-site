/**
 * LOCAL helper: publish a global's current draft (so an AI-translated Arabic draft
 * goes live on /ar/...). Talks to the RUNNING dev server over REST -- publishing a
 * global fires Payload's afterChange -> Next revalidatePath hook, which only works
 * inside a Next request (a standalone `payload run` script crashes on it), and
 * keeps a single writer on ./.db.
 *
 * Usage (dev server must be up on :3000):
 *   node scripts/publish-global.mjs <globalSlug> <email> <password>
 *   e.g. node scripts/publish-global.mjs footer admin@gtni.edu.eg 'your-local-admin-password'
 */
const [slug, email, password] = process.argv.slice(2)
const BASE = process.env.BASE_URL || 'http://localhost:3000'
if (!slug || !email || !password) {
  console.error('Usage: node scripts/publish-global.mjs <globalSlug> <email> <password>')
  process.exit(1)
}

const login = await fetch(`${BASE}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
if (!login.ok) {
  console.error(`login failed: ${login.status} ${await login.text()}`)
  process.exit(1)
}
const token = (await login.json()).token

const res = await fetch(`${BASE}/api/globals/${slug}?draft=false`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
  body: JSON.stringify({ _status: 'published' }),
})
const body = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error(`publish failed: ${res.status}`, JSON.stringify(body).slice(0, 400))
  process.exit(1)
}
console.log(`published ${slug}: ${body.message || 'ok'}`)

// Show the now-published Arabic for a couple of scalar fields.
const ar = await fetch(`${BASE}/api/globals/${slug}?locale=ar&depth=0`, {
  headers: { Authorization: `JWT ${token}` },
}).then((r) => r.json())
const sample = Object.entries(ar)
  .filter(([, v]) => typeof v === 'string' && v.trim() && v.length < 300)
  .slice(0, 6)
console.log('published AR sample:')
for (const [k, v] of sample) console.log(`  ${k}: ${v.slice(0, 90)}`)
