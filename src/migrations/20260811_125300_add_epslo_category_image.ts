import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`nursing_programs_epslos_categories\` ADD COLUMN \`image_id\` integer;`)
    await db.run(sql`CREATE INDEX \`nursing_programs_epslos_categories_image_idx\` ON \`nursing_programs_epslos_categories\` (\`image_id\`);`)
  } catch (e) {
    console.log('image_id column add skipped or already exists:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`DROP INDEX IF EXISTS \`nursing_programs_epslos_categories_image_idx\`;`)
  } catch (e) {
    console.log('down migration skipped:', e instanceof Error ? e.message : String(e))
  }
}
