import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`nursing_programs_courses\`;`)
  } catch (e) {
    console.log('nursing_programs_courses table drop skipped:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // down migration can be empty
}
