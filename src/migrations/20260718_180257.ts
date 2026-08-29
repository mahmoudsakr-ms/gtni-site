import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events\` (
  	  \`id\` integer PRIMARY KEY NOT NULL,
  	  \`title\` text NOT NULL,
  	  \`type\` text DEFAULT 'video' NOT NULL,
  	  \`published_date\` text NOT NULL,
  	  \`video_url\` text,
  	  \`thumbnail_id\` integer,
  	  \`excerpt\` text,
  	  \`item_category_id\` integer NOT NULL,
  	  \`is_pinned\` integer,
  	  \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	  \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	  FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	  FOREIGN KEY (\`item_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`)
  } catch (e) {
    console.log('news_events table creation skipped:', e);
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_thumbnail_idx\` ON \`news_events\` (\`thumbnail_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_item_category_idx\` ON \`news_events\` (\`item_category_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_updated_at_idx\` ON \`news_events\` (\`updated_at\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_created_at_idx\` ON \`news_events\` (\`created_at\`);`)
  } catch (e) {}

  try {
    await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`news_events_id\` integer REFERENCES news_events(id);`)
  } catch (e) {
    console.log('news_events_id column add skipped:', e);
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_news_events_id_idx\` ON \`payload_locked_documents_rels\` (\`news_events_id\`);`)
  } catch (e) {}
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events\`;`)
  } catch (e) {}
  try {
    await db.run(sql`PRAGMA foreign_keys=OFF;`)
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`__new_payload_locked_documents_rels\` (
  	  \`id\` integer PRIMARY KEY NOT NULL,
  	  \`order\` integer,
  	  \`parent_id\` integer NOT NULL,
  	  \`path\` text NOT NULL,
  	  \`users_id\` integer,
  	  \`media_id\` integer,
  	  \`news_category_id\` integer,
  	  \`media_categories_id\` integer,
  	  FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	  FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	  FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	  FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	  FOREIGN KEY (\`media_categories_id\`) REFERENCES \`media_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "news_category_id", "media_categories_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "news_category_id", "media_categories_id" FROM \`payload_locked_documents_rels\`;`)
    await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
    await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_news_category_id_idx\` ON \`payload_locked_documents_rels\` (\`news_category_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`media_categories_id\`);`)
  } catch (e) {}
}
