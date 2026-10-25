/**
 * LOCAL ONLY: surgical additive column add (ALTER TABLE ... ADD COLUMN) for the
 * new `content` richText field on the NewsEvents collection (UX-1 fix), bypassing
 * drizzle-kit's schema push -- which, on this production-dump-derived local DB,
 * also proposes dropping unrelated tables with real data due to pre-existing
 * schema drift (see MEMORY.md). This script touches only the one intended
 * column. Run with the dev server STOPPED (single writer on ./.db).
 */
import Database from 'libsql'

const db = new Database('./.db')

const cols = db.prepare('PRAGMA table_info(news_events)').all().map((r) => r.name)
console.log('Existing news_events columns:', cols)

if (cols.includes('content')) {
  console.log('Column already exists, nothing to do.')
} else {
  db.exec('ALTER TABLE news_events ADD COLUMN content text')
  console.log('Added content (jsonb/text) column to news_events.')
}

const after = db.prepare('PRAGMA table_info(news_events)').all().map((r) => r.name)
console.log('Columns after:', after)
db.close()
