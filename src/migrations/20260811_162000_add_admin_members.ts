import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`about_gtni\` ADD COLUMN \`admin_title\` text;`)
  } catch (e) {
    console.log('admin_title column already exists or skipped:', e instanceof Error ? e.message : String(e))
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_admin_members\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`role\` text,
      \`photo_id\` integer,
      \`bio\` text,
      FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_order_idx\` ON \`about_gtni_admin_members\` (\`_order\`);`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_parent_id_idx\` ON \`about_gtni_admin_members\` (\`_parent_id\`);`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_photo_idx\` ON \`about_gtni_admin_members\` (\`photo_id\`);`)
  } catch (e) {
    console.log('about_gtni_admin_members table creation error or skipped:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_admin_members\`;`)
  } catch (e) {
    console.log('down migration skipped:', e instanceof Error ? e.message : String(e))
  }
}
