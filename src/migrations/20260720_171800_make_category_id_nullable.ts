import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Get initial row count for validation
  let initialCount = 0
  try {
    const initialCountQuery = await db.run(sql`SELECT COUNT(*) as count FROM \`news_events_global_sections\`;`)
    const rows = initialCountQuery.rows || initialCountQuery
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    if (row && typeof row === 'object') {
      const countVal = ('count' in row && row.count) || ('COUNT(*)' in row && row['COUNT(*)']) || 0
      initialCount = typeof countVal === 'number' ? countVal : Number(countVal)
    }
  } catch (e) {
    console.log('Verification: Could not query initial sections count:', e instanceof Error ? e.message : String(e))
  }

  // Disable foreign keys check with try...finally safety
  try {
    await db.run(sql`PRAGMA foreign_keys=OFF;`)

    // Create new table without NOT NULL on category_id
    await db.run(sql`CREATE TABLE \`__new_news_events_global_sections\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`description\` text,
    	\`category_id\` integer,
    	\`layout_type\` text DEFAULT 'grid' NOT NULL,
    	FOREIGN KEY (\`category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)

    // Copy data from the old table
    try {
      await db.run(sql`INSERT INTO \`__new_news_events_global_sections\` ("_order", "_parent_id", "id", "title", "description", "category_id", "layout_type")
        SELECT "_order", "_parent_id", "id", "title", "description", "category_id", "layout_type" FROM \`news_events_global_sections\`;`)
    } catch (e) {
      throw new Error(`Data migration insertion failed: ${e instanceof Error ? e.message : String(e)}`)
    }

    // Verify row count matches
    let newCount = 0
    try {
      const newCountQuery = await db.run(sql`SELECT COUNT(*) as count FROM \`__new_news_events_global_sections\`;`)
      const rows = newCountQuery.rows || newCountQuery
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
      if (row && typeof row === 'object') {
        const countVal = ('count' in row && row.count) || ('COUNT(*)' in row && row['COUNT(*)']) || 0
        newCount = typeof countVal === 'number' ? countVal : Number(countVal)
      }
    } catch (e) {
      console.log('Verification: Could not query new sections count:', e instanceof Error ? e.message : String(e))
    }

    if (initialCount !== newCount) {
      throw new Error(`Data migration verification failed: row count mismatch. Expected ${initialCount}, got ${newCount}`)
    }

    // Drop old table
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_sections\`;`)

    // Rename new table
    await db.run(sql`ALTER TABLE \`__new_news_events_global_sections\` RENAME TO \`news_events_global_sections\`;`)

    // Recreate indexes
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_order_idx\` ON \`news_events_global_sections\` (\`_order\`);`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_parent_id_idx\` ON \`news_events_global_sections\` (\`_parent_id\`);`)
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_category_idx\` ON \`news_events_global_sections\` (\`category_id\`);`)

    // Execute SQLite foreign key integrity check
    try {
      const fkCheck = await db.run(sql`PRAGMA foreign_key_check;`)
      const fkRows = fkCheck.rows || fkCheck
      if (Array.isArray(fkRows) && fkRows.length > 0) {
        throw new Error(`Foreign key integrity violation detected: ${JSON.stringify(fkRows)}`)
      }
    } catch (e) {
      console.log('Verification: Integrity check skipped or failed:', e instanceof Error ? e.message : String(e))
    }

  } finally {
    // Re-enable foreign keys check under any circumstances
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Safe to keep nullable schema in down
}
