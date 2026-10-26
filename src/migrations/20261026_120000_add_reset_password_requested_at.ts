import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Payload 3.90.0 security release adds `resetPasswordRequestedAt` to auth
// collections (used to throttle forgot-password requests and clear lockouts
// on reset) -- see https://github.com/payloadcms/payload/releases/tag/v3.90.0.
// Sibling column to the existing `reset_password_expiration`, same shape.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`users\` ADD COLUMN \`reset_password_requested_at\` text;`)
  } catch (e) {
    console.log('reset_password_requested_at column add skipped or already exists:', e instanceof Error ? e.message : String(e))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_requested_at\`;`)
  } catch (e) {
    console.log('down migration skipped:', e instanceof Error ? e.message : String(e))
  }
}
