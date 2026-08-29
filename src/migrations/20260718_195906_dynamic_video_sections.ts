import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news_events_global_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`category_id\` integer NOT NULL,
  	\`layout_type\` text DEFAULT 'grid' NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_events_global_sections_order_idx\` ON \`news_events_global_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_sections_parent_id_idx\` ON \`news_events_global_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_sections_category_idx\` ON \`news_events_global_sections\` (\`category_id\`);`)
  try {
    await db.run(sql`ALTER TABLE \`news_events\` ADD \`_order\` text;`)
  } catch (e) {
    console.log('Adding news_events _order column skipped:', e)
  }
  try {
    await db.run(sql`CREATE INDEX \`news_events__order_idx\` ON \`news_events\` (\`_order\`);`)
  } catch (e) {
    console.log('Creating index news_events__order_idx skipped:', e)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`news_events_global_sections\`;`)
  try {
    await db.run(sql`DROP INDEX \`news_events__order_idx\`;`)
  } catch (e) {
    console.log('Dropping index news_events__order_idx skipped:', e)
  }
  try {
    await db.run(sql`ALTER TABLE \`news_events\` DROP COLUMN \`_order\`;`)
  } catch (e) {
    console.log('Dropping column news_events _order skipped:', e)
  }
}
