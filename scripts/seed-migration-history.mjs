/**
 * LOCAL DEV BOOTSTRAP helper, step 1 of 2 for a brand-new empty database.
 *
 * `payload migrate` snapshots "which migrations have already run" ONCE, at
 * the very start of the command -- before any migration's own `up()` gets a
 * chance to run (confirmed by reading @payloadcms/drizzle's migrate.js: the
 * `migrationsInDB` list is fetched once up front, and each migration file is
 * checked against that same static list for the rest of the run). That means
 * a migration's own `up()` cannot mark OTHER migrations as "already applied"
 * for the same `migrate` invocation -- by the time it would insert a row,
 * it's too late for this run to notice.
 *
 * This repo's 20 pre-2026-10-25 migrations are real history that production
 * already applied for real, but several of them are not safe to blindly
 * re-execute against the FINAL current schema (e.g. one SELECTs a column
 * from `scholarships` that an even-later migration already renamed away) --
 * confirmed by trying it and watching it fail with "no such column:
 * sawiris_foundation_title". They must be SKIPPED, not re-run, on a fresh
 * database that's being bootstrapped straight to the current schema.
 *
 * So: run this script ONCE, BEFORE `pnpm run payload migrate`, against a
 * brand-new/empty database. It creates the `payload_migrations` bookkeeping
 * table (which, like everything else pre-2026-10-25, was never created by a
 * migration -- only ever by DATABASE_PUSH) and marks the 20 old migration
 * names as already applied, batch 1. It does NOT touch the new
 * `00000000_000000_initial_schema` migration's own name -- that one is left
 * for `payload migrate` to actually run for real, since IT is what creates
 * the rest of the schema.
 *
 * Usage:
 *   DATABASE_URL="file:./path/to/fresh.db" node scripts/seed-migration-history.mjs
 *   DATABASE_URL="file:./path/to/fresh.db" pnpm run payload migrate
 */
import Database from 'libsql'

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('file:')) {
  console.error('Usage: DATABASE_URL="file:./path.db" node scripts/seed-migration-history.mjs')
  process.exit(1)
}
const dbPath = url.slice('file:'.length)

const OLD_MIGRATION_NAMES = [
  '20260718_143700_rename_student_life_to_services',
  '20260718_153500_scholarships_blocks',
  '20260718_180257',
  '20260718_180459',
  '20260718_183336_order_column',
  '20260718_195906_dynamic_video_sections',
  '20260718_202015_restore_array_tables',
  '20260718_203349_clean_news_events_global_rels',
  '20260720_171800_make_category_id_nullable',
  '20260720_200829_add_category_tree',
  '20260721_103049_init_news_sections',
  '20260721_140000_remove_parent_category_column',
  '20260721_151000_add_settings',
  '20260722_194500_news_events_drafts',
  '20260810_134500_add_domains_image_title',
  '20260810_141500_add_testimonial_job_title',
  '20260811_125300_add_epslo_category_image',
  '20260811_132000_remove_nursing_programs_courses_table',
  '20260811_162000_add_admin_members',
  '20260811_170000_remove_settings_global',
]

const db = new Database(dbPath)

const existingTables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()
if (existingTables.length > 0) {
  console.error(
    `Refusing to run: ${dbPath} is not empty (${existingTables.length} tables already present). ` +
      'This script is only for seeding a brand-new, truly empty database.',
  )
  process.exit(1)
}

db.exec(`
  CREATE TABLE \`payload_migrations\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text,
    \`batch\` numeric,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
`)

const insert = db.prepare('INSERT INTO payload_migrations (name, batch) VALUES (?, 1)')
for (const name of OLD_MIGRATION_NAMES) {
  insert.run(name)
}

console.log(`Seeded payload_migrations with ${OLD_MIGRATION_NAMES.length} pre-applied names in ${dbPath}.`)
console.log('Now run: pnpm run payload migrate')
db.close()
