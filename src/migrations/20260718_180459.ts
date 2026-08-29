import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_featured_items\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`news_events_global_featured_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'video' NOT NULL,
  	\`published_date\` text NOT NULL,
  	\`video_url\` text,
  	\`thumbnail_id\` integer,
  	\`excerpt\` text,
  	\`item_category_id\` integer NOT NULL,
  	\`is_pinned\` integer,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`item_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_events_global_featured_items_order_idx\` ON \`news_events_global_featured_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_featured_items_parent_id_idx\` ON \`news_events_global_featured_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_featured_items_thumbnail_idx\` ON \`news_events_global_featured_items\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`news_events_global_featured_items_item_category_idx\` ON \`news_events_global_featured_items\` (\`item_category_id\`);`)
}
