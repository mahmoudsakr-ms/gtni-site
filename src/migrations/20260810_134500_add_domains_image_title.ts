import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`admission\` ADD COLUMN \`domains_image_title\` text;`)
  } catch (e) {
    console.log('domains_image_title column add skipped or already exists:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // down migration can be empty for SQLite column additions
}
