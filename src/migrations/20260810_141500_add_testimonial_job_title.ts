import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`home_testimonials_items\` ADD COLUMN \`job_title\` text;`)
  } catch (e) {
    console.log('job_title column add skipped or already exists:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // down migration can be empty for SQLite column additions
}
