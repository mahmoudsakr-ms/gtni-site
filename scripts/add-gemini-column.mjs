/**
 * LOCAL ONLY: surgical additive column add (ALTER TABLE ... ADD COLUMN) for the new
 * `geminiApiKey` field on the Settings global, bypassing drizzle-kit's schema push --
 * which, on this production-dump-derived local DB, also proposes dropping unrelated
 * tables with real data due to pre-existing schema drift. This script touches only
 * the one intended column. Run with the dev server STOPPED (single writer on ./.db).
 */
import Database from 'libsql'

const db = new Database('./.db')

const cols = db.prepare('PRAGMA table_info(settings)').all().map((r) => r.name)
console.log('Existing settings columns:', cols)

if (cols.includes('gemini_api_key')) {
  console.log('Column already exists, nothing to do.')
} else {
  db.exec('ALTER TABLE settings ADD COLUMN gemini_api_key TEXT')
  console.log('Added gemini_api_key TEXT column to settings.')
}

const after = db.prepare('PRAGMA table_info(settings)').all().map((r) => r.name)
console.log('Columns after:', after)
db.close()
