/**
 * LOCAL-ONLY schema build. Takes a copy of the production dump (already at ./.db,
 * on the pre-localization schema) and builds the EN/AR localized schema onto it,
 * backfilling every existing value into the `en` locale, so `main` (Phases 2-4)
 * can run against real content locally -- including the draft/publish flow, which
 * rewrites the base + *_locales tables and therefore needs them to match `main`'s
 * schema exactly (not just have the new tables bolted on).
 *
 * This is a disposable-DB build for local testing, NOT the production migration.
 * The real Phase 2 production migration must still be hand-written and reviewed
 * separately (see PLAN_SECURITY_I18N.md). The live VPS is never contacted.
 *
 * Usage:
 *   cp db_dump/gtni.db .db
 *   node scripts/build-local-i18n-db.mjs
 *
 * Reference schema is read from the 161-table local dev DB captured earlier.
 */
import Database from 'libsql'
import fs from 'node:fs'

const REF_PATH = process.env.REF_DB || './.db.backup_predump_20260905_170132'
const WORK_PATH = process.env.WORK_DB || './.db'

if (!fs.existsSync(REF_PATH)) throw new Error(`Reference DB not found: ${REF_PATH}`)
if (!fs.existsSync(WORK_PATH)) throw new Error(`Working DB not found: ${WORK_PATH}`)

const ref = new Database(REF_PATH, { readonly: true })
const work = new Database(WORK_PATH)

const log = (...a) => console.log(...a)
const colNames = (db, t) => db.prepare(`PRAGMA table_info("${t}")`).all().map((c) => c.name)
const listTables = (db) =>
  db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((r) => r.name)

const refTables = ref
  .prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
const refIndexes = ref
  .prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name")
  .all()

const dumpTablesBefore = new Set(listTables(work))

const draftGlobals = [
  'about_gtni', 'admission', 'courses', 'footer', 'header', 'home',
  'news_events_global', 'nursing_programs', 'scholarships', 'student_services', 'vacancies',
]

work.pragma('foreign_keys = OFF')
work.exec('BEGIN')

try {
  // ---------------------------------------------------------------------------
  // 1. Create every table that exists in the localized reference but not the dump
  //    (all *_locales, all *_v* version tables, `settings`).
  // ---------------------------------------------------------------------------
  const toCreate = refTables.filter((t) => !dumpTablesBefore.has(t.name))
  log(`\n[1] Creating ${toCreate.length} missing tables...`)
  for (const t of toCreate) work.exec(t.sql)

  // ---------------------------------------------------------------------------
  // 2. Backfill non-version *_locales tables with an `en` row per parent row,
  //    copying from the (soon to be removed) localized columns on the dump's
  //    base tables. MUST run before the rebuild in step 3 removes those columns.
  // ---------------------------------------------------------------------------
  log(`\n[2] Backfilling *_locales tables (en)...`)
  const localeTables = refTables
    .map((t) => t.name)
    .filter((n) => n.endsWith('_locales') && !n.startsWith('_'))
    .sort()

  for (const lt of localeTables) {
    const parent = lt.slice(0, -'_locales'.length)
    if (!listTables(work).includes(parent)) { log(`   ! ${lt}: parent ${parent} absent, skipped`); continue }
    const refLocaleCols = colNames(ref, lt).filter((c) => !['id', '_locale', '_parent_id'].includes(c))
    const parentCols = new Set(colNames(work, parent))
    const copyCols = refLocaleCols.filter((c) => parentCols.has(c))
    if (work.prepare(`SELECT COUNT(*) c FROM "${parent}"`).get().c === 0) { log(`   - ${lt}: parent empty`); continue }
    const colList = ['_parent_id', '_locale', ...copyCols].map((c) => `"${c}"`).join(', ')
    const selList = ['id', `'en'`, ...copyCols.map((c) => `"${c}"`)].join(', ')
    const info = work.prepare(`INSERT INTO "${lt}" (${colList}) SELECT ${selList} FROM "${parent}"`).run()
    log(`   + ${lt}: ${info.changes} row(s) [${copyCols.join(', ') || 'none'}]`)
  }

  // ---------------------------------------------------------------------------
  // 3. Rebuild every base table whose columns diverge from the reference, so its
  //    shape EXACTLY matches `main` (removes moved-to-locales columns, fixes
  //    NOT NULL / FK / index differences). Copies the intersecting columns.
  //    Rename-dance instead of DROP COLUMN so FK/indexed columns are handled too.
  // ---------------------------------------------------------------------------
  log(`\n[3] Rebuilding divergent base tables to match reference...`)
  const refByName = new Map(refTables.map((t) => [t.name, t]))
  let rebuilt = 0
  for (const t of refTables) {
    if (!dumpTablesBefore.has(t.name)) continue // freshly created in step 1, already correct
    const refCols = colNames(ref, t.name)
    const workCols = colNames(work, t.name)
    const diff =
      refCols.length !== workCols.length || refCols.some((c, i) => c !== workCols[i])
    if (!diff) continue
    const common = refCols.filter((c) => workCols.includes(c))
    work.exec(`DROP TABLE IF EXISTS "__rebuild_${t.name}"`)
    work.exec(refByName.get(t.name).sql.replace(/^CREATE TABLE\s+[`"]?\w+[`"]?/i, `CREATE TABLE "__rebuild_${t.name}"`))
    const cl = common.map((c) => `"${c}"`).join(', ')
    work.exec(`INSERT INTO "__rebuild_${t.name}" (${cl}) SELECT ${cl} FROM "${t.name}"`)
    work.exec(`DROP TABLE "${t.name}"`)
    work.exec(`ALTER TABLE "__rebuild_${t.name}" RENAME TO "${t.name}"`)
    log(`   ~ ${t.name}: rebuilt (${workCols.length} -> ${refCols.length} cols, ${common.length} copied)`)
    rebuilt++
  }
  log(`   ${rebuilt} table(s) rebuilt`)

  // ---------------------------------------------------------------------------
  // 4. The draft-enabled page globals hold live production content -> 'published'.
  // ---------------------------------------------------------------------------
  log(`\n[4] Marking draft-enabled globals as published...`)
  for (const g of draftGlobals) {
    if (!listTables(work).includes(g)) continue
    if (!colNames(work, g).includes('_status')) { log(`   ! ${g}: no _status column`); continue }
    const n = work.prepare(`UPDATE "${g}" SET "_status" = 'published'`).run()
    log(`   + ${g}: ${n.changes} row(s) -> published`)
  }

  // ---------------------------------------------------------------------------
  // 5. (Re)create all reference indexes for tables now present (base tables lost
  //    their indexes in the rebuild; new tables never had them).
  // ---------------------------------------------------------------------------
  log(`\n[5] Creating indexes...`)
  let idxCreated = 0
  const existingIdx = new Set(work.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map((r) => r.name))
  for (const idx of refIndexes) {
    if (!listTables(work).includes(idx.tbl_name)) continue
    if (existingIdx.has(idx.name)) continue
    const cols = new Set(colNames(work, idx.tbl_name))
    const indexedCols = [...idx.sql.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((c) => c !== idx.tbl_name && c !== idx.name)
    if (indexedCols.some((c) => !cols.has(c))) { log(`   ! ${idx.name}: skipped (missing col)`); continue }
    work.exec(idx.sql)
    idxCreated++
  }
  log(`   ${idxCreated} created`)

  // ---------------------------------------------------------------------------
  // 6. Ensure the `settings` global has a row (dropped pre-main, re-added on main).
  // ---------------------------------------------------------------------------
  log(`\n[6] settings global row...`)
  if (listTables(work).includes('settings') && work.prepare('SELECT COUNT(*) c FROM settings').get().c === 0) {
    const now = new Date().toISOString()
    work
      .prepare(
        `INSERT INTO settings (id, email_from_address, email_from_name, smtp_host, smtp_port, smtp_user, smtp_secure, updated_at, created_at)
         VALUES (1, 'info@gtni.edu.eg', 'Gouna Technical Nursing Institute', 'mail.gtni.edu.eg', 465, 'info@gtni.edu.eg', 1, ?, ?)`,
      )
      .run(now, now)
    log(`   + settings: seeded row id=1 (google_translate_api_key = NULL)`)
  } else {
    log(`   - settings: unchanged`)
  }

  work.exec('COMMIT')
  log(`\n[commit] done`)

  // ---------------------------------------------------------------------------
  // 7. Checks
  // ---------------------------------------------------------------------------
  const fk = work.prepare('PRAGMA foreign_key_check').all()
  log(fk.length ? `\n[FK CHECK] ${fk.length} violation(s):` : `\n[FK CHECK] clean`)
  for (const v of fk.slice(0, 40)) log('   ', JSON.stringify(v))

  // every base table must now match the reference exactly
  let shapeProblems = 0
  for (const t of refTables) {
    if (!listTables(work).includes(t.name)) { log(`   MISSING ${t.name}`); shapeProblems++; continue }
    const a = colNames(ref, t.name).join(',')
    const b = colNames(work, t.name).join(',')
    if (a !== b) { log(`   SHAPE ${t.name}\n     ref:  ${a}\n     work: ${b}`); shapeProblems++ }
  }
  log(shapeProblems ? `\n[SHAPE] ${shapeProblems} table(s) differ from reference` : `[SHAPE] all ${refTables.length} tables match reference`)

  log(`\n[result] work DB has ${listTables(work).length} tables (reference: ${refTables.length}).`)
  if (fk.length || shapeProblems) process.exitCode = 1
} catch (e) {
  work.exec('ROLLBACK')
  console.error('\n[ERROR] rolled back:', e)
  process.exitCode = 1
} finally {
  work.pragma('foreign_keys = ON')
  ref.close()
  work.close()
}
