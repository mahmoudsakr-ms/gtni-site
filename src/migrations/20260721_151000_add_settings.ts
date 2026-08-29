import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`settings\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`email_from_address\` text DEFAULT 'info@gtni.edu.eg',
  	\`email_from_name\` text DEFAULT 'GTNI Admin',
  	\`smtp_host\` text DEFAULT 'mail.gtni.edu.eg',
  	\`smtp_port\` numeric DEFAULT 465,
  	\`smtp_user\` text DEFAULT 'info@gtni.edu.eg',
  	\`smtp_pass\` text,
  	\`smtp_secure\` integer DEFAULT 1,
  	\`resend_api_key\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`settings\`;`)
}
