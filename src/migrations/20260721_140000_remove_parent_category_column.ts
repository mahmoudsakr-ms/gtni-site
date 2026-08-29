import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP INDEX IF EXISTS \`news_category_parent_idx\`;`)
  
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`__new_news_category\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`visible\` integer DEFAULT 1,
  	\`updated_at\` text,
  	\`created_at\` text
  );`)

  await db.run(sql`INSERT INTO \`__new_news_category\` ("id", "name", "order", "visible", "updated_at", "created_at")
    SELECT "id", "name", "order", "visible", "updated_at", "created_at" FROM \`news_category\`;`)

  await db.run(sql`DROP TABLE \`news_category\`;`)
  await db.run(sql`ALTER TABLE \`__new_news_category\` RENAME TO \`news_category\`;`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`news_category_name_idx\` ON \`news_category\` (\`name\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`news_category\` ADD \`parent_id\` integer REFERENCES news_category(id);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_category_parent_idx\` ON \`news_category\` (\`parent_id\`);`)
}
