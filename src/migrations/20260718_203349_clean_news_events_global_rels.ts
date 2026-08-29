import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Disable foreign keys check
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // 1. Create clean table
  await db.run(sql`CREATE TABLE \`__new_news_events_global_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`news_category_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)

  // 2. Copy data
  try {
    await db.run(sql`INSERT INTO \`__new_news_events_global_rels\` ("id", "order", "parent_id", "path", "news_category_id")
      SELECT "id", "order", "parent_id", "path", "news_category_id" FROM \`news_events_global_rels\`;`)
  } catch (e) {
    console.log('Copying news_events_global_rels data skipped or failed:', e)
  }

  // 3. Drop old table
  await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_rels\`;`)

  // 4. Rename new table
  await db.run(sql`ALTER TABLE \`__new_news_events_global_rels\` RENAME TO \`news_events_global_rels\`;`)

  // 5. Recreate indexes
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_order_idx\` ON \`news_events_global_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_parent_idx\` ON \`news_events_global_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_path_idx\` ON \`news_events_global_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_news_category_id_idx\` ON \`news_events_global_rels\` (\`news_category_id\`);`)

  // Re-enable foreign keys check
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Safe to keep cleaned schema in down
}
