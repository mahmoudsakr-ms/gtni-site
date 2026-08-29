import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news_events_global_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`section_id\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`layout_type\` text DEFAULT 'tabs' NOT NULL,
  	\`show_all_button_text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_events_global_sections_order_idx\` ON \`news_events_global_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_sections_parent_id_idx\` ON \`news_events_global_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`news_events_global_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`news_category_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_events_global_rels_order_idx\` ON \`news_events_global_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_rels_parent_idx\` ON \`news_events_global_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_rels_path_idx\` ON \`news_events_global_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_rels_news_category_id_idx\` ON \`news_events_global_rels\` (\`news_category_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news_events_global_displayed_categories\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category_id\` integer,
  	\`layout_type\` text DEFAULT 'tabs',
  	\`title_override\` text,
  	\`description_override\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_news_events_global_displayed_categories\`("_order", "_parent_id", "id", "category_id", "layout_type", "title_override", "description_override") SELECT "_order", "_parent_id", "id", "category_id", "layout_type", "title_override", "description_override" FROM \`news_events_global_displayed_categories\`;`)
  await db.run(sql`DROP TABLE \`news_events_global_displayed_categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_news_events_global_displayed_categories\` RENAME TO \`news_events_global_displayed_categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_order_idx\` ON \`news_events_global_displayed_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_parent_id_idx\` ON \`news_events_global_displayed_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_category_idx\` ON \`news_events_global_displayed_categories\` (\`category_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`news_events_global_sections\`;`)
  await db.run(sql`DROP TABLE \`news_events_global_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news_events_global_displayed_categories\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category_id\` integer NOT NULL,
  	\`layout_type\` text DEFAULT 'tabs' NOT NULL,
  	\`title_override\` text,
  	\`description_override\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_news_events_global_displayed_categories\`("_order", "_parent_id", "id", "category_id", "layout_type", "title_override", "description_override") SELECT "_order", "_parent_id", "id", "category_id", "layout_type", "title_override", "description_override" FROM \`news_events_global_displayed_categories\`;`)
  await db.run(sql`DROP TABLE \`news_events_global_displayed_categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_news_events_global_displayed_categories\` RENAME TO \`news_events_global_displayed_categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_order_idx\` ON \`news_events_global_displayed_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_parent_id_idx\` ON \`news_events_global_displayed_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_category_idx\` ON \`news_events_global_displayed_categories\` (\`category_id\`);`)
}
