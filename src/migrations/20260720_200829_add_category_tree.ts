import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news_events_global_displayed_categories\` (
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
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_order_idx\` ON \`news_events_global_displayed_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_parent_id_idx\` ON \`news_events_global_displayed_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_displayed_categories_category_idx\` ON \`news_events_global_displayed_categories\` (\`category_id\`);`)
  await db.run(sql`DROP TABLE \`news_events_global_sections\`;`)
  await db.run(sql`DROP TABLE \`news_events_global_rels\`;`)
  await db.run(sql`ALTER TABLE \`news_category\` ADD \`parent_id\` integer REFERENCES news_category(id);`)
  await db.run(sql`ALTER TABLE \`news_category\` ADD \`order\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`news_category\` ADD \`visible\` integer DEFAULT true;`)
  await db.run(sql`CREATE INDEX \`news_category_parent_idx\` ON \`news_category\` (\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  await db.run(sql`DROP TABLE \`news_events_global_displayed_categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news_category\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_news_category\`("id", "name", "updated_at", "created_at") SELECT "id", "name", "updated_at", "created_at" FROM \`news_category\`;`)
  await db.run(sql`DROP TABLE \`news_category\`;`)
  await db.run(sql`ALTER TABLE \`__new_news_category\` RENAME TO \`news_category\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_category_name_idx\` ON \`news_category\` (\`name\`);`)
  await db.run(sql`CREATE INDEX \`news_category_updated_at_idx\` ON \`news_category\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_category_created_at_idx\` ON \`news_category\` (\`created_at\`);`)
}
