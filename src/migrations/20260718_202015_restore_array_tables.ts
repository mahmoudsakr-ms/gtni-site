import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`category_id\` integer NOT NULL,
  	\`layout_type\` text DEFAULT 'grid' NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_order_idx\` ON \`news_events_global_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_parent_id_idx\` ON \`news_events_global_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_category_idx\` ON \`news_events_global_sections\` (\`category_id\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_sections_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`news_category_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news_events_global_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)

  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_rels_order_idx\` ON \`news_events_global_sections_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_rels_parent_idx\` ON \`news_events_global_sections_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_rels_path_idx\` ON \`news_events_global_sections_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_rels_news_category_id_idx\` ON \`news_events_global_sections_rels\` (\`news_category_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_sections_rels\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_sections\`;`)
}
