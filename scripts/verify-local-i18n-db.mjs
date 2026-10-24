/** Post-build sanity checks for the locally-built localized DB. Read-only. */
import Database from 'libsql'

const REF_PATH = process.env.REF_DB || './.db.backup_predump_20260905_170132'
const WORK_PATH = process.env.WORK_DB || './.db'

const ref = new Database(REF_PATH, { readonly: true })
const work = new Database(WORK_PATH, { readonly: true })

const tables = (db) =>
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name)

let problems = 0
const fail = (m) => { problems++; console.log('  FAIL ' + m) }
const ok = (m) => console.log('  ok   ' + m)

// 1. every reference table exists in work
const workSet = new Set(tables(work))
const missing = tables(ref).filter((t) => !workSet.has(t))
if (missing.length) fail(`missing tables: ${missing.join(', ')}`)
else ok(`all ${tables(ref).length} reference tables present`)

// 2. each non-version *_locales has exactly one 'en' row per parent row, and no other locale
console.log('\n[locale row counts]')
for (const lt of tables(ref).filter((n) => n.endsWith('_locales') && !n.startsWith('_')).sort()) {
  const parent = lt.slice(0, -'_locales'.length)
  if (!workSet.has(parent)) { fail(`${lt}: parent ${parent} missing`); continue }
  const pc = work.prepare(`SELECT COUNT(*) c FROM "${parent}"`).get().c
  const en = work.prepare(`SELECT COUNT(*) c FROM "${lt}" WHERE _locale='en'`).get().c
  const other = work.prepare(`SELECT COUNT(*) c FROM "${lt}" WHERE _locale<>'en'`).get().c
  if (en !== pc || other !== 0) fail(`${lt}: parent=${pc} en=${en} other=${other}`)
  else ok(`${lt}: ${en}/${pc} en rows`)
}

// 3. draft globals marked published
console.log('\n[global _status]')
for (const g of ['about_gtni','admission','courses','footer','header','home','news_events_global','nursing_programs','scholarships','student_services','vacancies']) {
  const rows = work.prepare(`SELECT _status, COUNT(*) c FROM "${g}" GROUP BY _status`).all()
  const bad = rows.filter((r) => r._status !== 'published')
  if (bad.length) fail(`${g}: ${JSON.stringify(rows)}`)
  else ok(`${g}: ${JSON.stringify(rows)}`)
}

// 4. migration history intact (21 rows), integrity + FK checks
console.log('\n[integrity]')
const mig = work.prepare('SELECT COUNT(*) c FROM payload_migrations').get().c
mig === 21 ? ok(`payload_migrations: ${mig} rows`) : fail(`payload_migrations: ${mig} rows (expected 21)`)
const integ = work.prepare('PRAGMA integrity_check').all()
;(integ.length === 1 && integ[0].integrity_check === 'ok') ? ok('integrity_check ok') : fail(JSON.stringify(integ))
const fk = work.prepare('PRAGMA foreign_key_check').all()
fk.length === 0 ? ok('foreign_key_check clean') : fail(`${fk.length} FK violations`)

// 5. spot-check real content survived
console.log('\n[content spot-check]')
const checks = [
  ['media', 'SELECT COUNT(*) c FROM media', 77],
  ['news_events', 'SELECT COUNT(*) c FROM news_events', 35],
  ['about_gtni_faculty_members', 'SELECT COUNT(*) c FROM about_gtni_faculty_members', 12],
]
for (const [label, sql, expect] of checks) {
  const c = work.prepare(sql).get().c
  c === expect ? ok(`${label}: ${c}`) : fail(`${label}: ${c} (expected ${expect})`)
}
const heroEn = work.prepare("SELECT hero_title FROM home_locales WHERE _locale='en'").get()
console.log(`  home_locales en hero_title: ${JSON.stringify(heroEn?.hero_title)}`)
const facultyEn = work.prepare("SELECT name FROM about_gtni_faculty_members_locales WHERE _locale='en' LIMIT 3").all()
console.log(`  faculty en names: ${JSON.stringify(facultyEn.map((r) => r.name))}`)

console.log(`\n${problems === 0 ? 'ALL CHECKS PASSED' : problems + ' CHECK(S) FAILED'}`)
process.exitCode = problems ? 1 : 0
ref.close()
work.close()
