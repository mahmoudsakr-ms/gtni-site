import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Create blocks table for scholarship section (the reorderable blocks)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS \`scholarships_blocks_scholarship_section\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`_path\` text NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`title\` text NOT NULL,
      \`content\` text NOT NULL,
      \`image_id\` integer,
      \`block_name\` text
    );
  `)

  // 1.5. Add button_text and button_link columns to the scholarships table if they don't exist
  try {
    await db.run(sql`ALTER TABLE \`scholarships\` ADD COLUMN \`button_text\` text;`)
  } catch (e) {
    // Column might already exist
  }
  try {
    await db.run(sql`ALTER TABLE \`scholarships\` ADD COLUMN \`button_link\` text;`)
  } catch (e) {
    // Column might already exist
  }

  // 2. Create the child table for accommodation facilities gallery images referencing scholarships(id)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS \`acc_fac_images\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`image_id\` integer,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships\`(\`id\`) ON DELETE CASCADE
    );
  `)

  // 3. Query existing static data from scholarships table and migrate to blocks
  const scholarshipsRows = await db.run(sql`
    SELECT 
      \`sawiris_foundation_title\`, 
      \`sawiris_foundation_content\`, 
      \`sawiris_foundation_image_id\`
    FROM \`scholarships\`
    LIMIT 1;
  `) as { rows: any[] }

  const row = scholarshipsRows.rows?.[0]
  if (row) {
    const scholarshipBlockId = 'block_sch_' + Math.random().toString(36).substr(2, 9)

    // Migrate GtniScholarship (Sawiris Foundation) data if it exists
    if (row.sawiris_foundation_title || row.sawiris_foundation_content) {
      await db.run(sql`
        INSERT INTO \`scholarships_blocks_scholarship_section\` (
          \`_order\`, \`_parent_id\`, \`_path\`, \`id\`, \`title\`, \`content\`, \`image_id\`, \`block_name\`
        ) VALUES (
          1, 
          1, 
          'pageBlocks',
          ${scholarshipBlockId}, 
          ${row.sawiris_foundation_title || 'The GTNI Scholarship'}, 
          ${row.sawiris_foundation_content || '{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}'}, 
          ${row.sawiris_foundation_image_id || null}, 
          'The GTNI Scholarship'
        );
      `)
    }
  }

  // 4. Move data from old scholarships_accommodation_facilities_image to acc_fac_images if table exists
  try {
    const galleryRows = await db.run(sql`
      SELECT \`_order\`, \`image_id\` FROM \`scholarships_accommodation_facilities_image\` WHERE \`_parent_id\` = 1;
    `) as { rows: any[] }

    if (galleryRows.rows?.length > 0) {
      for (const imgRow of galleryRows.rows) {
        const imgId = 'img_' + Math.random().toString(36).substr(2, 9)
        await db.run(sql`
          INSERT INTO \`acc_fac_images\` (
            \`_order\`, \`_parent_id\`, \`id\`, \`image_id\`
          ) VALUES (
            ${imgRow._order}, 
            1, 
            ${imgId}, 
            ${imgRow.image_id}
          );
        `)
      }
    }
  } catch (e: any) {
    // Ignore if table does not exist or has been dropped
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`scholarships_blocks_scholarship_section\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`acc_fac_images\`;`)
}
