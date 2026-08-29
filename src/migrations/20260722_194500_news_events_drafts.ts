import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Add _status column to news_events table if it doesn't exist
  try {
    await db.run(sql`ALTER TABLE \`news_events\` ADD COLUMN \`_status\` text DEFAULT 'published';`)
  } catch (e) {
    console.log('_status column add skipped or already exists:', e instanceof Error ? e.message : String(e))
  }

  // 2. Safely ensure all existing news & video rows are explicitly set to 'published'
  try {
    await db.run(sql`UPDATE \`news_events\` SET \`_status\` = 'published' WHERE \`_status\` IS NULL OR \`_status\` = '';`)
  } catch (e) {
    console.log('Update existing news_events status skipped:', e instanceof Error ? e.message : String(e))
  }

  // 3. Create version table for Payload drafts versioning
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_v\` (
      \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      \`parent_id\` integer,
      \`version__order\` integer,
      \`version_title\` text,
      \`version_type\` text DEFAULT 'video',
      \`version_published_date\` text,
      \`version_video_url\` text,
      \`version_thumbnail_id\` integer,
      \`version_excerpt\` text,
      \`version_item_category_id\` integer,
      \`version_is_pinned\` integer,
      \`version_updated_at\` text,
      \`version_created_at\` text,
      \`version__status\` text DEFAULT 'draft',
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`latest\` integer,
      FOREIGN KEY (\`parent_id\`) REFERENCES \`news_events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`version_item_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null
    );`)
  } catch (e) {
    console.log('_news_events_v table creation skipped:', e instanceof Error ? e.message : String(e))
  }

  // 4. Create indexes for versions table
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_v_parent_idx\` ON \`_news_events_v\` (\`parent_id\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_v_version_version__status_idx\` ON \`_news_events_v\` (\`version__status\`);`)
  } catch (e) {}
  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_v_latest_idx\` ON \`_news_events_v\` (\`latest\`);`)
  } catch (e) {}

  // 5. Populate versions table for all existing news_events items
  try {
    await db.run(sql`INSERT INTO \`_news_events_v\` (
      \`parent_id\`,
      \`version__order\`,
      \`version_title\`,
      \`version_type\`,
      \`version_published_date\`,
      \`version_video_url\`,
      \`version_thumbnail_id\`,
      \`version_excerpt\`,
      \`version_item_category_id\`,
      \`version_is_pinned\`,
      \`version__status\`,
      \`latest\`
    )
    SELECT 
      \`id\`,
      \`_order\`,
      \`title\`,
      \`type\`,
      \`published_date\`,
      \`video_url\`,
      \`thumbnail_id\`,
      \`excerpt\`,
      \`item_category_id\`,
      \`is_pinned\`,
      \`_status\`,
      1
    FROM \`news_events\`
    WHERE \`id\` NOT IN (SELECT \`parent_id\` FROM \`_news_events_v\` WHERE \`parent_id\` IS NOT NULL);`)
  } catch (e) {
    console.log('Version sync skipped:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_v\`;`)
  } catch (e) {}
}
