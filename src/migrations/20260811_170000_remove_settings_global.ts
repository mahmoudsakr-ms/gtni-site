import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`settings\`;`)
  } catch (e) {
    console.log('drop table settings skipped or error:', e instanceof Error ? e.message : String(e))
  }
}

export async function down(): Promise<void> {
  // No-op
}
