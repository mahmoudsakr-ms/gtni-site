import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`news_events\` ADD COLUMN \`_order\` text;`)
  } catch (e) {
    console.log('Adding _order column skipped:', e)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`news_events\` DROP COLUMN \`_order\`;`)
  } catch (e) {
    console.log('Dropping _order column skipped:', e)
  }
}
