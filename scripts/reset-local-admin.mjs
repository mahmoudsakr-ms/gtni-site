/**
 * LOCAL ONLY: reset a user's password in the local dev DB via Payload's Local API
 * (proper salt/hash), then verify it by logging in. Run with the dev server
 * STOPPED so there is exactly one writer on ./.db. Does not touch the live VPS.
 *
 * Usage: node scripts/reset-local-admin.mjs <email> <new-password>
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const email = process.argv[2]
const password = process.argv[3]
if (!email || !password) {
  console.error('Usage: node scripts/reset-local-admin.mjs <email> <new-password>')
  process.exit(1)
}

const payload = await getPayload({ config })
const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!found.docs.length) {
  console.error(`No user with email ${email}. Existing users:`)
  const all = await payload.find({ collection: 'users', limit: 50 })
  for (const u of all.docs) console.error('  -', u.email)
  process.exit(1)
}

const user = found.docs[0]
await payload.update({
  collection: 'users',
  id: user.id,
  data: { password, loginAttempts: 0, lockUntil: null },
})
console.log(`Password reset for ${email} (id ${user.id}).`)

// Verify immediately.
try {
  const res = await payload.login({ collection: 'users', data: { email, password } })
  console.log(`Verified: login OK for ${res.user.email} (token len ${res.token?.length ?? 0}).`)
} catch (e) {
  console.error('Verification FAILED:', e instanceof Error ? e.message : e)
  process.exit(1)
}
process.exit(0)
