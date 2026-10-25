import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * INITIAL / BASELINE schema migration -- LOCAL DEV TOOLING ONLY, not yet
 * validated against (and NOT safe to blindly run against) the real production
 * database. See PROGRESS.md / MEMORY.md (2026-10-25 entry) for the full
 * reasoning. Summary:
 *
 * This repo's migration chain (the 20 migrations below this one, all dated
 * 2026-07/08) was never actually replayable from an empty database -- its
 * first migration assumes a `student_life` table already exists, and more
 * fundamentally, `payload_migrations` itself (Payload's own bookkeeping
 * table) was never created by any migration; every real schema change since
 * has only ever existed locally via `DATABASE_PUSH=true`. Production has
 * applied all 20 of those migrations for real (confirmed against a real
 * production dump in an earlier session) and nothing past them -- Phases
 * 2/3/4 and everything from today's security/E2E/UI-UX fixes exist ONLY via
 * local push, never migrated anywhere, including here.
 *
 * This migration creates the ENTIRE current schema (dumped verbatim from a
 * truly empty database that was freshly `DATABASE_PUSH`-ed against today's
 * `main` -- 161 tables) in one step, so a brand-new LOCAL dev database can be
 * bootstrapped via `pnpm run payload migrate` instead of needing push mode.
 *
 * REQUIRED FIRST STEP -- run `scripts/seed-migration-history.mjs` against the
 * fresh database BEFORE `pnpm run payload migrate`. Payload snapshots "which
 * migrations have already run" once, at the very start of the `migrate`
 * command, before this migration's own `up()` ever executes -- so this
 * migration cannot mark the 20 old ones as already-applied itself (confirmed
 * by trying exactly that: it silently has no effect on the run that's
 * already in progress). The seed script creates `payload_migrations` and
 * pre-marks the 20 old names as applied (batch 1) so Payload's migrate
 * runner skips re-executing their now-inapplicable, pre-rename-era logic
 * against a database that this migration has already brought to its final
 * shape -- several of them are NOT safe to replay as-is (confirmed: one
 * SELECTs a `scholarships` column that a later migration already renamed
 * away, and fails with "no such column" if actually re-run here).
 *
 * This does NOT delete, rename, or alter any of the 20 old migration files,
 * and does not change what name is recorded for them, since those exact
 * names are what production's real `payload_migrations` table already has
 * recorded for real.
 *
 * Explicitly NOT in scope here (separate, deferred, needs direct VPS access
 * and a real copy of production's database to validate against): actually
 * deploying any of this to production.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_sessions\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`created_at\` text,
	\`expires_at\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`users_sessions skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`users\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`email\` text NOT NULL,
	\`reset_password_token\` text,
	\`reset_password_expiration\` text,
	\`salt\` text,
	\`hash\` text,
	\`login_attempts\` numeric DEFAULT 0,
	\`lock_until\` text
);`)
  } catch (e: any) {
    payload.logger.info(`users skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`media\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`alt\` text,
	\`category_id\` integer,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`url\` text,
	\`thumbnail_u_r_l\` text,
	\`filename\` text,
	\`mime_type\` text,
	\`filesize\` numeric,
	\`width\` numeric,
	\`height\` numeric,
	\`focal_x\` numeric,
	\`focal_y\` numeric,
	\`sizes_thumbnail_url\` text,
	\`sizes_thumbnail_width\` numeric,
	\`sizes_thumbnail_height\` numeric,
	\`sizes_thumbnail_mime_type\` text,
	\`sizes_thumbnail_filesize\` numeric,
	\`sizes_thumbnail_filename\` text,
	\`sizes_card_url\` text,
	\`sizes_card_width\` numeric,
	\`sizes_card_height\` numeric,
	\`sizes_card_mime_type\` text,
	\`sizes_card_filesize\` numeric,
	\`sizes_card_filename\` text,
	\`sizes_tablet_url\` text,
	\`sizes_tablet_width\` numeric,
	\`sizes_tablet_height\` numeric,
	\`sizes_tablet_mime_type\` text,
	\`sizes_tablet_filesize\` numeric,
	\`sizes_tablet_filename\` text,
	FOREIGN KEY (\`category_id\`) REFERENCES \`media_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`media skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_category\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`order\` numeric DEFAULT 0,
	\`visible\` integer DEFAULT true,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`news_category skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`media_categories\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`media_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_order\` text,
	\`_status\` text DEFAULT 'published',
	\`title\` text NOT NULL,
	\`type\` text DEFAULT 'video' NOT NULL,
	\`published_date\` text NOT NULL,
	\`video_url\` text,
	\`thumbnail_id\` integer,
	\`excerpt\` text,
	\`content\` text,
	\`item_category_id\` integer NOT NULL,
	\`is_pinned\` integer,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`item_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`news_events skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_kv\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`data\` text NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`payload_kv skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_locked_documents\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`global_slug\` text,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_locked_documents_rels\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`order\` integer,
	\`parent_id\` integer NOT NULL,
	\`path\` text NOT NULL,
	\`users_id\` integer,
	\`media_id\` integer,
	\`news_category_id\` integer,
	\`media_categories_id\` integer,
	\`news_events_id\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`media_categories_id\`) REFERENCES \`media_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`news_events_id\`) REFERENCES \`news_events\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_preferences\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`key\` text,
	\`value\` text,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_preferences_rels\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`order\` integer,
	\`parent_id\` integer NOT NULL,
	\`path\` text NOT NULL,
	\`users_id\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`payload_migrations\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`name\` text,
	\`batch\` numeric,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);`)
  } catch (e: any) {
    payload.logger.info(`payload_migrations skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`header_nav_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`global_page\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`header_nav_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`header_nav_items_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`header_nav_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`header_login_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`link\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`header_login_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`header_login_links_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_login_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`header_login_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`header\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`logo_id\` integer,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`header skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_header_v_version_nav_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`global_page\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_header_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_nav_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_header_v_version_nav_items_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_header_v_version_nav_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_nav_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_header_v_version_login_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`link\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_header_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_login_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_header_v_version_login_links_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_header_v_version_login_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_login_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_header_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_logo_id\` integer,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_header_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_hero_slider\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_hero_slider skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_feature_cards_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`global_page\` text,
	\`card_image_id\` integer,
	FOREIGN KEY (\`card_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_feature_cards_cards_locales\` (
	\`card_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_feature_cards_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_testimonials_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_testimonials_items_locales\` (
	\`student_name\` text,
	\`job_title\` text,
	\`quote\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_testimonials_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_type\` text DEFAULT 'video',
	\`hero_video_source\` text DEFAULT 'local',
	\`hero_video_id\` integer,
	\`hero_external_video_url\` text,
	\`welcome_signature_image_id\` integer,
	\`feature_cards_enabled\` integer DEFAULT true,
	\`testimonials_enabled\` integer DEFAULT true,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`welcome_signature_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`home skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`home_locales\` (
	\`hero_title\` text,
	\`hero_subtitle\` text,
	\`announcement_line1\` text DEFAULT 'BE A PART OF AN EXCITING FUTURE',
	\`announcement_line2\` text DEFAULT 'EDUCATING , INSPIRING , ENABLEING',
	\`welcome_title\` text DEFAULT 'Welcome to the Gouna Technical Nursing Institute',
	\`welcome_content\` text,
	\`welcome_signature\` text DEFAULT 'Mr., Gouna Technical Nursing Institute',
	\`testimonials_title\` text DEFAULT 'Student Testimonials',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`home_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_version_hero_slider\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_hero_slider skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_version_feature_cards_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`global_page\` text,
	\`card_image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`card_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_version_feature_cards_cards_locales\` (
	\`card_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v_version_feature_cards_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_version_testimonials_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_version_testimonials_items_locales\` (
	\`student_name\` text,
	\`job_title\` text,
	\`quote\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v_version_testimonials_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_type\` text DEFAULT 'video',
	\`version_hero_video_source\` text DEFAULT 'local',
	\`version_hero_video_id\` integer,
	\`version_hero_external_video_url\` text,
	\`version_welcome_signature_image_id\` integer,
	\`version_feature_cards_enabled\` integer DEFAULT true,
	\`version_testimonials_enabled\` integer DEFAULT true,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_welcome_signature_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_home_v_locales\` (
	\`version_hero_title\` text,
	\`version_hero_subtitle\` text,
	\`version_announcement_line1\` text DEFAULT 'BE A PART OF AN EXCITING FUTURE',
	\`version_announcement_line2\` text DEFAULT 'EDUCATING , INSPIRING , ENABLEING',
	\`version_welcome_title\` text DEFAULT 'Welcome to the Gouna Technical Nursing Institute',
	\`version_welcome_content\` text,
	\`version_welcome_signature\` text DEFAULT 'Mr., Gouna Technical Nursing Institute',
	\`version_testimonials_title\` text DEFAULT 'Student Testimonials',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`section_id\` text,
	\`layout_type\` text DEFAULT 'tabs',
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_sections_locales\` (
	\`title\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text
);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_locales\` (
	\`hero_title\` text DEFAULT 'News & Events',
	\`hero_subtitle\` text DEFAULT 'Stay updated with the latest happenings, academic excellence, and student life at GTNI.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`news_events_global_rels\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`order\` integer,
	\`parent_id\` integer NOT NULL,
	\`path\` text NOT NULL,
	\`news_category_id\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`news_events_global\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_global_v_version_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`section_id\` text,
	\`layout_type\` text DEFAULT 'tabs',
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_events_global_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_global_v_version_sections_locales\` (
	\`title\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_events_global_v_version_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_global_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer
);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_global_v_locales\` (
	\`version_hero_title\` text DEFAULT 'News & Events',
	\`version_hero_subtitle\` text DEFAULT 'Stay updated with the latest happenings, academic excellence, and student life at GTNI.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_events_global_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_news_events_global_v_rels\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`order\` integer,
	\`parent_id\` integer NOT NULL,
	\`path\` text NOT NULL,
	\`news_category_id\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`_news_events_global_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`news_category_id\`) REFERENCES \`news_category\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_social_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`platform\` text,
	\`url\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`footer_social_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_quick_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`global_page\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`footer_quick_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_quick_links_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_quick_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`footer_quick_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`logo_id\` integer,
	\`contact_info_phone\` text,
	\`contact_info_email\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`footer skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`footer_locales\` (
	\`description\` text DEFAULT 'Empowering students to achieve their dreams through world-class education and a supportive community.',
	\`contact_info_address\` text,
	\`copyright_text\` text DEFAULT '© 2026 GTNI. All rights reserved.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`footer_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_footer_v_version_social_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`platform\` text,
	\`url\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_social_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_footer_v_version_quick_links\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`global_page\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_quick_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_footer_v_version_quick_links_locales\` (
	\`label\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v_version_quick_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_quick_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_footer_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_logo_id\` integer,
	\`version_contact_info_phone\` text,
	\`version_contact_info_email\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_footer_v_locales\` (
	\`version_description\` text DEFAULT 'Empowering students to achieve their dreams through world-class education and a supportive community.',
	\`version_contact_info_address\` text,
	\`version_copyright_text\` text DEFAULT '© 2026 GTNI. All rights reserved.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses_semesters_courses\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` text NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`course_code\` text,
	\`course_name\` text DEFAULT 'Course',
	\`class_hours\` numeric DEFAULT 0,
	\`clinical_hours\` numeric DEFAULT 0,
	\`total_course_hours\` numeric DEFAULT 0,
	\`total_credit\` numeric DEFAULT 0,
	\`prerequisites\` text,
	\`corequisites\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`courses_semesters\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses_semesters_courses_locales\` (
	\`course_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`courses_semesters_courses\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses_semesters\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`weeks\` numeric DEFAULT 15,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`courses\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses_semesters_locales\` (
	\`name\` text,
	\`tab_label\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`courses_semesters\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_image_id\` integer,
	\`clinical_hours_min\` text DEFAULT '135',
	\`clinical_hours_max\` text DEFAULT '255',
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`courses_locales\` (
	\`hero_title\` text DEFAULT 'Our Courses',
	\`hero_subtitle\` text DEFAULT 'Competency-based curriculum designed for nursing excellence',
	\`overview_title\` text DEFAULT 'Competency-Based Curriculum',
	\`overview_content\` text,
	\`credit_hours_title\` text DEFAULT 'Credit Hours System',
	\`credit_hours_description\` text DEFAULT 'GTNI works on a credit hours system. The Cumulative Grade Point Average (GPA) begins with NU101 Semester.',
	\`credit_hours_rules\` text DEFAULT '1 hour of classroom instruction/week = 1 course credit
2 hours of non-nursing course laboratory/week = 1 course credit
3 hours of nursing course clinical laboratory/week = 1 course credit',
	\`competency_title\` text DEFAULT 'COMPETENCY-BASED CURRICULUM',
	\`competency_description\` text DEFAULT 'GTNI offers a wide-ranging curriculum which is taken over three years. Each semester, students, accompanied by Clinical Instructors, undertake between 135 and 255 hours of clinical practice in approved hospital settings. Students also carry out clinical consolidation each summer to practice their skills. After successful completion of the academic program, students are required to complete a clinical internship for a period of six months in a leading hospital within Egypt.

For Graduation students are expected to complete the total course hours of the internship and pass the exit exam with a score of 70% or more.',
	\`clinical_hours_text\` text DEFAULT 'Hours of clinical practice in approved hospital settings.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`courses\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v_version_semesters_courses\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`course_code\` text,
	\`course_name\` text DEFAULT 'Course',
	\`class_hours\` numeric DEFAULT 0,
	\`clinical_hours\` numeric DEFAULT 0,
	\`total_course_hours\` numeric DEFAULT 0,
	\`total_credit\` numeric DEFAULT 0,
	\`prerequisites\` text,
	\`corequisites\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_courses_v_version_semesters\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v_version_semesters_courses_locales\` (
	\`course_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_courses_v_version_semesters_courses\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v_version_semesters\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`weeks\` numeric DEFAULT 15,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_courses_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v_version_semesters_locales\` (
	\`name\` text,
	\`tab_label\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_courses_v_version_semesters\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_image_id\` integer,
	\`version_clinical_hours_min\` text DEFAULT '135',
	\`version_clinical_hours_max\` text DEFAULT '255',
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_courses_v_locales\` (
	\`version_hero_title\` text DEFAULT 'Our Courses',
	\`version_hero_subtitle\` text DEFAULT 'Competency-based curriculum designed for nursing excellence',
	\`version_overview_title\` text DEFAULT 'Competency-Based Curriculum',
	\`version_overview_content\` text,
	\`version_credit_hours_title\` text DEFAULT 'Credit Hours System',
	\`version_credit_hours_description\` text DEFAULT 'GTNI works on a credit hours system. The Cumulative Grade Point Average (GPA) begins with NU101 Semester.',
	\`version_credit_hours_rules\` text DEFAULT '1 hour of classroom instruction/week = 1 course credit
2 hours of non-nursing course laboratory/week = 1 course credit
3 hours of nursing course clinical laboratory/week = 1 course credit',
	\`version_competency_title\` text DEFAULT 'COMPETENCY-BASED CURRICULUM',
	\`version_competency_description\` text DEFAULT 'GTNI offers a wide-ranging curriculum which is taken over three years. Each semester, students, accompanied by Clinical Instructors, undertake between 135 and 255 hours of clinical practice in approved hospital settings. Students also carry out clinical consolidation each summer to practice their skills. After successful completion of the academic program, students are required to complete a clinical internship for a period of six months in a leading hospital within Egypt.

For Graduation students are expected to complete the total course hours of the internship and pass the exit exam with a score of 70% or more.',
	\`version_clinical_hours_text\` text DEFAULT 'Hours of clinical practice in approved hospital settings.',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_courses_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_services_service_images\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` text NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_service_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_services_table_data_table_rows\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` text NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_table_data_table_rows skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_services_table_data_table_rows_locales\` (
	\`col1\` text,
	\`col2\` text,
	\`col3\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services_services_table_data_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_table_data_table_rows_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_services\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`has_table\` integer DEFAULT false,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_services_locales\` (
	\`service_name\` text,
	\`service_description\` text,
	\`additional_note\` text,
	\`table_data_table_title\` text,
	\`table_data_column_header1\` text,
	\`table_data_column_header2\` text,
	\`table_data_column_header3\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_image_id\` integer,
	\`handbook_id\` integer,
	\`handbook_url\` text,
	\`review_date\` text,
	\`approval_date\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`handbook_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`student_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`student_services_locales\` (
	\`hero_title\` text DEFAULT 'Student Services',
	\`hero_subtitle\` text DEFAULT 'Discover the services and support available to enhance your journey at GTNI.',
	\`overview_category\` text DEFAULT 'Student Services Overview',
	\`student_services_list_title\` text DEFAULT 'Student Services List',
	\`purpose\` text,
	\`policy_title\` text DEFAULT 'Student Policy',
	\`policy_description\` text,
	\`reviewed_by\` text DEFAULT 'Administrative Committee',
	\`approved_by\` text DEFAULT 'Administrative Committee',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`student_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`student_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_version_services_service_images\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v_version_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_service_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_version_services_table_data_table_rows\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v_version_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_table_data_table_rows skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_version_services_table_data_table_rows_locales\` (
	\`col1\` text,
	\`col2\` text,
	\`col3\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v_version_services_table_data_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_table_data_table_rows_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_version_services\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`has_table\` integer DEFAULT false,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_version_services_locales\` (
	\`service_name\` text,
	\`service_description\` text,
	\`additional_note\` text,
	\`table_data_table_title\` text,
	\`table_data_column_header1\` text,
	\`table_data_column_header2\` text,
	\`table_data_column_header3\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v_version_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_image_id\` integer,
	\`version_handbook_id\` integer,
	\`version_handbook_url\` text,
	\`version_review_date\` text,
	\`version_approval_date\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_handbook_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_student_services_v_locales\` (
	\`version_hero_title\` text DEFAULT 'Student Services',
	\`version_hero_subtitle\` text DEFAULT 'Discover the services and support available to enhance your journey at GTNI.',
	\`version_overview_category\` text DEFAULT 'Student Services Overview',
	\`version_student_services_list_title\` text DEFAULT 'Student Services List',
	\`version_purpose\` text,
	\`version_policy_title\` text DEFAULT 'Student Policy',
	\`version_policy_description\` text,
	\`version_reviewed_by\` text DEFAULT 'Administrative Committee',
	\`version_approved_by\` text DEFAULT 'Administrative Committee',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_student_services_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_stats\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_stats skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_stats_locales\` (
	\`label\` text,
	\`value\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_stats_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_leadership_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_leadership_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni_leadership_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_other_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_other_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni_other_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_faculty_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_faculty_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni_faculty_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_admin_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_admin_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni_admin_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`type\` text DEFAULT 'image',
	\`hero_image_id\` integer,
	\`video_source\` text DEFAULT 'local',
	\`video_id\` integer,
	\`external_video_url\` text,
	\`philosophy_image_id\` integer,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`philosophy_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`about_gtni_locales\` (
	\`hero_title\` text DEFAULT 'About GTNI',
	\`hero_subtitle\` text,
	\`mission\` text,
	\`vision\` text,
	\`philosophy_title\` text DEFAULT 'Academic Philosophy',
	\`philosophy_content\` text,
	\`section_title\` text DEFAULT 'GTNI In Numbers',
	\`leadership_title\` text DEFAULT 'Board Members',
	\`other_title\` text,
	\`faculty_title\` text DEFAULT 'Faculty Members',
	\`admin_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_gtni\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_stats\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_stats skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_stats_locales\` (
	\`label\` text,
	\`value\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v_version_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_stats_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_leadership_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_leadership_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v_version_leadership_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_other_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_other_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v_version_other_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_faculty_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_faculty_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v_version_faculty_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_admin_members\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`photo_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_version_admin_members_locales\` (
	\`name\` text,
	\`role\` text,
	\`bio\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v_version_admin_members\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_type\` text DEFAULT 'image',
	\`version_hero_image_id\` integer,
	\`version_video_source\` text DEFAULT 'local',
	\`version_video_id\` integer,
	\`version_external_video_url\` text,
	\`version_philosophy_image_id\` integer,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_philosophy_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_about_gtni_v_locales\` (
	\`version_hero_title\` text DEFAULT 'About GTNI',
	\`version_hero_subtitle\` text,
	\`version_mission\` text,
	\`version_vision\` text,
	\`version_philosophy_title\` text DEFAULT 'Academic Philosophy',
	\`version_philosophy_content\` text,
	\`version_section_title\` text DEFAULT 'GTNI In Numbers',
	\`version_leadership_title\` text DEFAULT 'Board Members',
	\`version_other_title\` text,
	\`version_faculty_title\` text DEFAULT 'Faculty Members',
	\`version_admin_title\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_gtni_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`nursing_programs_epslos_categories\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`nursing_programs\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`nursing_programs_epslos_categories_locales\` (
	\`title\` text,
	\`items\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`nursing_programs_epslos_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`nursing_programs\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_image_id\` integer,
	\`courses_section_image_id\` integer,
	\`courses_section_button_link\` text DEFAULT '/courses',
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`courses_section_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`nursing_programs_locales\` (
	\`hero_title\` text DEFAULT 'Nursing Programs',
	\`hero_subtitle\` text,
	\`overview\` text,
	\`epslos_section_title\` text DEFAULT 'EPSLOs',
	\`epslos_section_subtitle\` text DEFAULT 'End-of-Program Student Learning Outcomes',
	\`courses_section_section_title\` text DEFAULT 'Courses',
	\`courses_section_description\` text,
	\`courses_section_button_text\` text DEFAULT 'GO TO COURSES',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`nursing_programs\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_nursing_programs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories_locales\` (
	\`title\` text,
	\`items\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_nursing_programs_v_version_epslos_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_nursing_programs_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_image_id\` integer,
	\`version_courses_section_image_id\` integer,
	\`version_courses_section_button_link\` text DEFAULT '/courses',
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_courses_section_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_nursing_programs_v_locales\` (
	\`version_hero_title\` text DEFAULT 'Nursing Programs',
	\`version_hero_subtitle\` text,
	\`version_overview\` text,
	\`version_epslos_section_title\` text DEFAULT 'EPSLOs',
	\`version_epslos_section_subtitle\` text DEFAULT 'End-of-Program Student Learning Outcomes',
	\`version_courses_section_section_title\` text DEFAULT 'Courses',
	\`version_courses_section_description\` text,
	\`version_courses_section_button_text\` text DEFAULT 'GO TO COURSES',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_nursing_programs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships_blocks_scholarship_section\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`_path\` text NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`block_name\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships_blocks_scholarship_section_locales\` (
	\`title\` text,
	\`content\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships_blocks_scholarship_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`acc_fac_images\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`acc_fac_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships_facilities_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`main_image_id\` integer,
	FOREIGN KEY (\`main_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships_facilities_sections_locales\` (
	\`title\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships_facilities_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_image_id\` integer,
	\`accommodation_image_id\` integer,
	\`button_link\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`accommodation_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`scholarships_locales\` (
	\`hero_title\` text DEFAULT 'Scholarships',
	\`hero_subtitle\` text DEFAULT 'Discover the services and support available to enhance your journey at GTNI.',
	\`accommodation_title\` text DEFAULT 'Accommodation',
	\`accommodation_content\` text,
	\`accommodation_facilities_title\` text DEFAULT 'Accommodation Facilities',
	\`button_text\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scholarships\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`_path\` text NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	\`block_name\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_locales\` (
	\`title\` text,
	\`content\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v_blocks_scholarship_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_acc_fac_images_v\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_acc_fac_images_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v_version_facilities_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`main_image_id\` integer,
	\`_uuid\` text,
	FOREIGN KEY (\`main_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v_version_facilities_sections_locales\` (
	\`title\` text,
	\`description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v_version_facilities_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_image_id\` integer,
	\`version_accommodation_image_id\` integer,
	\`version_button_link\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_accommodation_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_scholarships_v_locales\` (
	\`version_hero_title\` text DEFAULT 'Scholarships',
	\`version_hero_subtitle\` text DEFAULT 'Discover the services and support available to enhance your journey at GTNI.',
	\`version_accommodation_title\` text DEFAULT 'Accommodation',
	\`version_accommodation_content\` text,
	\`version_accommodation_facilities_title\` text DEFAULT 'Accommodation Facilities',
	\`version_button_text\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_scholarships_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_admission_decision_aspects\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_admission_decision_aspects skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_admission_decision_aspects_locales\` (
	\`aspect\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission_admission_decision_aspects\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_admission_decision_aspects_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_requirements_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_requirements_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_requirements_list_locales\` (
	\`requirement\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission_requirements_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_requirements_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_submission_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_submission_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_submission_list_locales\` (
	\`document\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission_submission_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_submission_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_application_steps_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_application_steps_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_application_steps_list_locales\` (
	\`step\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission_application_steps_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_application_steps_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_domains_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_domains_list_locales\` (
	\`domain_title\` text,
	\`domain_description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission_domains_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`video_url\` text DEFAULT 'https://www.youtube.com/watch?v=VIDEO_ID',
	\`apply_button_link\` text DEFAULT '#',
	\`hero_image_id\` integer,
	\`steps_image_desktop_id\` integer,
	\`steps_image_mobile_id\` integer,
	\`domains_image_id\` integer,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`steps_image_desktop_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`steps_image_mobile_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`domains_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`admission skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`admission_locales\` (
	\`hero_title\` text DEFAULT 'ADMISSION 2025-2026',
	\`hero_description\` text DEFAULT 'For details and more explanation of the admission process 2025-2026, watch this video:',
	\`apply_button_text\` text DEFAULT 'Apply',
	\`qualifications_title\` text DEFAULT 'QUALIFICATIONS FOR SCHOLARSHIP',
	\`qualifications_content\` text,
	\`admission_decision_title\` text DEFAULT 'The admission decision is based on three aspects:',
	\`requirements_title\` text DEFAULT 'The admission requirements are identified in Close 28 and Close 29...',
	\`intro_info\` text,
	\`submission_title\` text DEFAULT 'CANDIDATES MUST SUBMIT THE BELOW TO PROVE THE ADMISSION REQUIREMENTS:',
	\`application_steps_title\` text DEFAULT 'FOLLOW THE FOLLOWING STEPS TO APPLY TO THE INSTITUTE.',
	\`steps_title\` text,
	\`domains_title\` text DEFAULT 'TO BE A PROFESSIONAL NURSE YOU NEED TO POSSESS THE FOLLOWING ESSENTIAL DOMAINS',
	\`domains_image_title\` text DEFAULT 'Core Competencies',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`admission\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`admission_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_admission_decision_aspects\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_admission_decision_aspects skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_admission_decision_aspects_locales\` (
	\`aspect\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v_version_admission_decision_aspects\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_admission_decision_aspects_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_requirements_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_requirements_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_requirements_list_locales\` (
	\`requirement\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v_version_requirements_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_requirements_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_submission_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_submission_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_submission_list_locales\` (
	\`document\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v_version_submission_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_submission_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_application_steps_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_application_steps_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_application_steps_list_locales\` (
	\`step\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v_version_application_steps_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_application_steps_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_domains_list\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_domains_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_version_domains_list_locales\` (
	\`domain_title\` text,
	\`domain_description\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v_version_domains_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_domains_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_video_url\` text DEFAULT 'https://www.youtube.com/watch?v=VIDEO_ID',
	\`version_apply_button_link\` text DEFAULT '#',
	\`version_hero_image_id\` integer,
	\`version_steps_image_desktop_id\` integer,
	\`version_steps_image_mobile_id\` integer,
	\`version_domains_image_id\` integer,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_steps_image_desktop_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_steps_image_mobile_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_domains_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_admission_v_locales\` (
	\`version_hero_title\` text DEFAULT 'ADMISSION 2025-2026',
	\`version_hero_description\` text DEFAULT 'For details and more explanation of the admission process 2025-2026, watch this video:',
	\`version_apply_button_text\` text DEFAULT 'Apply',
	\`version_qualifications_title\` text DEFAULT 'QUALIFICATIONS FOR SCHOLARSHIP',
	\`version_qualifications_content\` text,
	\`version_admission_decision_title\` text DEFAULT 'The admission decision is based on three aspects:',
	\`version_requirements_title\` text DEFAULT 'The admission requirements are identified in Close 28 and Close 29...',
	\`version_intro_info\` text,
	\`version_submission_title\` text DEFAULT 'CANDIDATES MUST SUBMIT THE BELOW TO PROVE THE ADMISSION REQUIREMENTS:',
	\`version_application_steps_title\` text DEFAULT 'FOLLOW THE FOLLOWING STEPS TO APPLY TO THE INSTITUTE.',
	\`version_steps_title\` text,
	\`version_domains_title\` text DEFAULT 'TO BE A PROFESSIONAL NURSE YOU NEED TO POSSESS THE FOLLOWING ESSENTIAL DOMAINS',
	\`version_domains_image_title\` text DEFAULT 'Core Competencies',
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_admission_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`vacancies_positions\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`status\` text DEFAULT 'published',
	\`type\` text DEFAULT 'full-time',
	\`deadline\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vacancies\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_positions skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`vacancies_positions_locales\` (
	\`title\` text,
	\`department\` text,
	\`description\` text,
	\`requirements\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vacancies_positions\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_positions_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`vacancies\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`hero_image_id\` integer,
	\`application_email\` text DEFAULT 'hr@gtni.edu.eg',
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`vacancies skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`vacancies_locales\` (
	\`hero_title\` text DEFAULT 'Join the GTNI Family',
	\`hero_description\` text,
	\`overview\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vacancies\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_vacancies_v_version_positions\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`status\` text DEFAULT 'published',
	\`type\` text DEFAULT 'full-time',
	\`deadline\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_vacancies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_positions skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_vacancies_v_version_positions_locales\` (
	\`title\` text,
	\`department\` text,
	\`description\` text,
	\`requirements\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_vacancies_v_version_positions\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_positions_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_vacancies_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_hero_image_id\` integer,
	\`version_application_email\` text DEFAULT 'hr@gtni.edu.eg',
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`snapshot\` integer,
	\`published_locale\` text,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`_vacancies_v_locales\` (
	\`version_hero_title\` text DEFAULT 'Join the GTNI Family',
	\`version_hero_description\` text,
	\`version_overview\` text,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_vacancies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS \`settings\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`email_from_address\` text DEFAULT 'info@gtni.edu.eg',
	\`email_from_name\` text DEFAULT 'GTNI Admin',
	\`smtp_host\` text DEFAULT 'mail.gtni.edu.eg',
	\`smtp_port\` numeric DEFAULT 465,
	\`smtp_user\` text DEFAULT 'info@gtni.edu.eg',
	\`smtp_pass\` text,
	\`smtp_secure\` integer DEFAULT true,
	\`resend_api_key\` text,
	\`google_translate_api_key\` text,
	\`gemini_api_key\` text,
	\`updated_at\` text,
	\`created_at\` text
);`)
  } catch (e: any) {
    payload.logger.info(`settings skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`users_sessions_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`users_sessions_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`users_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`users_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`users_email_idx\` ON \`users\` (\`email\`);`)
  } catch (e: any) {
    payload.logger.info(`users_email_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_category_idx\` ON \`media\` (\`category_id\`);`)
  } catch (e: any) {
    payload.logger.info(`media_category_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`media_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`media_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  } catch (e: any) {
    payload.logger.info(`media_filename_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  } catch (e: any) {
    payload.logger.info(`media_sizes_thumbnail_sizes_thumbnail_filename_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  } catch (e: any) {
    payload.logger.info(`media_sizes_card_sizes_card_filename_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_sizes_tablet_sizes_tablet_filename_idx\` ON \`media\` (\`sizes_tablet_filename\`);`)
  } catch (e: any) {
    payload.logger.info(`media_sizes_tablet_sizes_tablet_filename_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`news_category_name_idx\` ON \`news_category\` (\`name\`);`)
  } catch (e: any) {
    payload.logger.info(`news_category_name_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_category_updated_at_idx\` ON \`news_category\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`news_category_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_category_created_at_idx\` ON \`news_category\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`news_category_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`media_categories_title_idx\` ON \`media_categories\` (\`title\`);`)
  } catch (e: any) {
    payload.logger.info(`media_categories_title_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_categories_updated_at_idx\` ON \`media_categories\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`media_categories_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`media_categories_created_at_idx\` ON \`media_categories\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`media_categories_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events__order_idx\` ON \`news_events\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events__order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_thumbnail_idx\` ON \`news_events\` (\`thumbnail_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_thumbnail_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_item_category_idx\` ON \`news_events\` (\`item_category_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_item_category_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_updated_at_idx\` ON \`news_events\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_created_at_idx\` ON \`news_events\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_kv_key_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_global_slug_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_parent_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_users_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_media_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_news_category_id_idx\` ON \`payload_locked_documents_rels\` (\`news_category_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_news_category_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`media_categories_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_media_categories_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_news_events_id_idx\` ON \`payload_locked_documents_rels\` (\`news_events_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_locked_documents_rels_news_events_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_key_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_rels_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_rels_parent_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_rels_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_preferences_rels_users_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_migrations_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`payload_migrations_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header_nav_items_order_idx\` ON \`header_nav_items\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`header_nav_items_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header_nav_items_parent_id_idx\` ON \`header_nav_items\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`header_nav_items_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`header_nav_items_locales_locale_parent_id_unique\` ON \`header_nav_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`header_nav_items_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header_login_links_order_idx\` ON \`header_login_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`header_login_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header_login_links_parent_id_idx\` ON \`header_login_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`header_login_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`header_login_links_locales_locale_parent_id_unique\` ON \`header_login_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`header_login_links_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header_logo_idx\` ON \`header\` (\`logo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`header_logo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`header__status_idx\` ON \`header\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`header__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_nav_items_order_idx\` ON \`_header_v_version_nav_items\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_nav_items_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_nav_items_parent_id_idx\` ON \`_header_v_version_nav_items\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_nav_items_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_header_v_version_nav_items_locales_locale_parent_id_unique\` ON \`_header_v_version_nav_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_nav_items_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_login_links_order_idx\` ON \`_header_v_version_login_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_login_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_login_links_parent_id_idx\` ON \`_header_v_version_login_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_login_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_header_v_version_login_links_locales_locale_parent_id_uniqu\` ON \`_header_v_version_login_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_login_links_locales_locale_parent_id_uniqu skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_version_logo_idx\` ON \`_header_v\` (\`version_logo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_version_logo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_version_version__status_idx\` ON \`_header_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_created_at_idx\` ON \`_header_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_updated_at_idx\` ON \`_header_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_snapshot_idx\` ON \`_header_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_published_locale_idx\` ON \`_header_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_header_v_latest_idx\` ON \`_header_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_header_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_hero_slider_order_idx\` ON \`home_hero_slider\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`home_hero_slider_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_hero_slider_parent_id_idx\` ON \`home_hero_slider\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_hero_slider_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_hero_slider_image_idx\` ON \`home_hero_slider\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_hero_slider_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_feature_cards_cards_order_idx\` ON \`home_feature_cards_cards\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_feature_cards_cards_parent_id_idx\` ON \`home_feature_cards_cards\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_feature_cards_cards_card_image_idx\` ON \`home_feature_cards_cards\` (\`card_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards_card_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`home_feature_cards_cards_locales_locale_parent_id_unique\` ON \`home_feature_cards_cards_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_feature_cards_cards_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_testimonials_items_order_idx\` ON \`home_testimonials_items\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_testimonials_items_parent_id_idx\` ON \`home_testimonials_items\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_testimonials_items_image_idx\` ON \`home_testimonials_items\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`home_testimonials_items_locales_locale_parent_id_unique\` ON \`home_testimonials_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_testimonials_items_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_hero_hero_video_idx\` ON \`home\` (\`hero_video_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_hero_hero_video_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home_welcome_welcome_signature_image_idx\` ON \`home\` (\`welcome_signature_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_welcome_welcome_signature_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`home__status_idx\` ON \`home\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`home__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`home_locales_locale_parent_id_unique\` ON \`home_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`home_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_hero_slider_order_idx\` ON \`_home_v_version_hero_slider\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_hero_slider_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_hero_slider_parent_id_idx\` ON \`_home_v_version_hero_slider\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_hero_slider_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_hero_slider_image_idx\` ON \`_home_v_version_hero_slider\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_hero_slider_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_feature_cards_cards_order_idx\` ON \`_home_v_version_feature_cards_cards\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_feature_cards_cards_parent_id_idx\` ON \`_home_v_version_feature_cards_cards\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_feature_cards_cards_card_image_idx\` ON \`_home_v_version_feature_cards_cards\` (\`card_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards_card_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_home_v_version_feature_cards_cards_locales_locale_parent_id\` ON \`_home_v_version_feature_cards_cards_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_feature_cards_cards_locales_locale_parent_id skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_testimonials_items_order_idx\` ON \`_home_v_version_testimonials_items\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_testimonials_items_parent_id_idx\` ON \`_home_v_version_testimonials_items\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_testimonials_items_image_idx\` ON \`_home_v_version_testimonials_items\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_home_v_version_testimonials_items_locales_locale_parent_id_\` ON \`_home_v_version_testimonials_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_testimonials_items_locales_locale_parent_id_ skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_hero_version_hero_video_idx\` ON \`_home_v\` (\`version_hero_video_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_hero_version_hero_video_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_welcome_version_welcome_signature_image_idx\` ON \`_home_v\` (\`version_welcome_signature_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_welcome_version_welcome_signature_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_version_version__status_idx\` ON \`_home_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_created_at_idx\` ON \`_home_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_updated_at_idx\` ON \`_home_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_snapshot_idx\` ON \`_home_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_published_locale_idx\` ON \`_home_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_home_v_latest_idx\` ON \`_home_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_home_v_locales_locale_parent_id_unique\` ON \`_home_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_home_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_order_idx\` ON \`news_events_global_sections\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_sections_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_sections_parent_id_idx\` ON \`news_events_global_sections\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_sections_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`news_events_global_sections_locales_locale_parent_id_unique\` ON \`news_events_global_sections_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_sections_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global__status_idx\` ON \`news_events_global\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`news_events_global_locales_locale_parent_id_unique\` ON \`news_events_global_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_order_idx\` ON \`news_events_global_rels\` (\`order\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_rels_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_parent_idx\` ON \`news_events_global_rels\` (\`parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_rels_parent_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_path_idx\` ON \`news_events_global_rels\` (\`path\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_rels_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`news_events_global_rels_news_category_id_idx\` ON \`news_events_global_rels\` (\`news_category_id\`);`)
  } catch (e: any) {
    payload.logger.info(`news_events_global_rels_news_category_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_version_sections_order_idx\` ON \`_news_events_global_v_version_sections\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_sections_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_version_sections_parent_id_idx\` ON \`_news_events_global_v_version_sections\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_sections_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_news_events_global_v_version_sections_locales_locale_parent\` ON \`_news_events_global_v_version_sections_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_sections_locales_locale_parent skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_version_version__status_idx\` ON \`_news_events_global_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_created_at_idx\` ON \`_news_events_global_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_updated_at_idx\` ON \`_news_events_global_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_snapshot_idx\` ON \`_news_events_global_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_published_locale_idx\` ON \`_news_events_global_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_latest_idx\` ON \`_news_events_global_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_news_events_global_v_locales_locale_parent_id_unique\` ON \`_news_events_global_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_rels_order_idx\` ON \`_news_events_global_v_rels\` (\`order\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_rels_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_rels_parent_idx\` ON \`_news_events_global_v_rels\` (\`parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_rels_parent_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_rels_path_idx\` ON \`_news_events_global_v_rels\` (\`path\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_rels_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_news_events_global_v_rels_news_category_id_idx\` ON \`_news_events_global_v_rels\` (\`news_category_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_news_events_global_v_rels_news_category_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_social_links_order_idx\` ON \`footer_social_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_social_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_social_links_parent_id_idx\` ON \`footer_social_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_social_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_quick_links_order_idx\` ON \`footer_quick_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_quick_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_quick_links_parent_id_idx\` ON \`footer_quick_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_quick_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`footer_quick_links_locales_locale_parent_id_unique\` ON \`footer_quick_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_quick_links_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer_logo_idx\` ON \`footer\` (\`logo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_logo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`footer__status_idx\` ON \`footer\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`footer__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`footer_locales_locale_parent_id_unique\` ON \`footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`footer_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_social_links_order_idx\` ON \`_footer_v_version_social_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_social_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_social_links_parent_id_idx\` ON \`_footer_v_version_social_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_social_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_quick_links_order_idx\` ON \`_footer_v_version_quick_links\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_quick_links_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_quick_links_parent_id_idx\` ON \`_footer_v_version_quick_links\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_quick_links_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_footer_v_version_quick_links_locales_locale_parent_id_uniqu\` ON \`_footer_v_version_quick_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_quick_links_locales_locale_parent_id_uniqu skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_version_logo_idx\` ON \`_footer_v\` (\`version_logo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_version_logo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_version_version__status_idx\` ON \`_footer_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_created_at_idx\` ON \`_footer_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_updated_at_idx\` ON \`_footer_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_snapshot_idx\` ON \`_footer_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_published_locale_idx\` ON \`_footer_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_footer_v_latest_idx\` ON \`_footer_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_footer_v_locales_locale_parent_id_unique\` ON \`_footer_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_footer_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses_semesters_courses_order_idx\` ON \`courses_semesters_courses\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_courses_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses_semesters_courses_parent_id_idx\` ON \`courses_semesters_courses\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_courses_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`courses_semesters_courses_locales_locale_parent_id_unique\` ON \`courses_semesters_courses_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_courses_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses_semesters_order_idx\` ON \`courses_semesters\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses_semesters_parent_id_idx\` ON \`courses_semesters\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`courses_semesters_locales_locale_parent_id_unique\` ON \`courses_semesters_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_semesters_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses_hero_image_idx\` ON \`courses\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`courses__status_idx\` ON \`courses\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`courses__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`courses_locales_locale_parent_id_unique\` ON \`courses_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`courses_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_semesters_courses_order_idx\` ON \`_courses_v_version_semesters_courses\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_courses_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_semesters_courses_parent_id_idx\` ON \`_courses_v_version_semesters_courses\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_courses_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_courses_v_version_semesters_courses_locales_locale_parent_i\` ON \`_courses_v_version_semesters_courses_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_courses_locales_locale_parent_i skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_semesters_order_idx\` ON \`_courses_v_version_semesters\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_semesters_parent_id_idx\` ON \`_courses_v_version_semesters\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_courses_v_version_semesters_locales_locale_parent_id_unique\` ON \`_courses_v_version_semesters_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_semesters_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_version_hero_image_idx\` ON \`_courses_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_version_version__status_idx\` ON \`_courses_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_created_at_idx\` ON \`_courses_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_updated_at_idx\` ON \`_courses_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_snapshot_idx\` ON \`_courses_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_published_locale_idx\` ON \`_courses_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_courses_v_latest_idx\` ON \`_courses_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_courses_v_locales_locale_parent_id_unique\` ON \`_courses_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_courses_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_service_images_order_idx\` ON \`student_services_services_service_images\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_service_images_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_service_images_parent_id_idx\` ON \`student_services_services_service_images\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_service_images_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_service_images_image_idx\` ON \`student_services_services_service_images\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_service_images_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_table_data_table_rows_order_idx\` ON \`student_services_services_table_data_table_rows\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_table_data_table_rows_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_table_data_table_rows_parent_id_idx\` ON \`student_services_services_table_data_table_rows\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_table_data_table_rows_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`student_services_services_table_data_table_rows_locales_loca\` ON \`student_services_services_table_data_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_table_data_table_rows_locales_loca skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_order_idx\` ON \`student_services_services\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_services_parent_id_idx\` ON \`student_services_services\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`student_services_services_locales_locale_parent_id_unique\` ON \`student_services_services_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_services_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_hero_image_idx\` ON \`student_services\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services_handbook_idx\` ON \`student_services\` (\`handbook_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_handbook_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`student_services__status_idx\` ON \`student_services\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`student_services_locales_locale_parent_id_unique\` ON \`student_services_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`student_services_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_service_images_order_idx\` ON \`_student_services_v_version_services_service_images\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_service_images_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_service_images_parent_id_idx\` ON \`_student_services_v_version_services_service_images\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_service_images_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_service_images_imag_idx\` ON \`_student_services_v_version_services_service_images\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_service_images_imag_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_table_data_table_rows_order_idx\` ON \`_student_services_v_version_services_table_data_table_rows\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_table_data_table_rows_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_table_data_table_rows_parent_id_idx\` ON \`_student_services_v_version_services_table_data_table_rows\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_table_data_table_rows_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_student_services_v_version_services_table_data_table_rows_l\` ON \`_student_services_v_version_services_table_data_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_table_data_table_rows_l skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_order_idx\` ON \`_student_services_v_version_services\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_services_parent_id_idx\` ON \`_student_services_v_version_services\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_student_services_v_version_services_locales_locale_parent_i\` ON \`_student_services_v_version_services_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_services_locales_locale_parent_i skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_version_hero_image_idx\` ON \`_student_services_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_version_handbook_idx\` ON \`_student_services_v\` (\`version_handbook_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_version_handbook_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_version_version__status_idx\` ON \`_student_services_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_created_at_idx\` ON \`_student_services_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_updated_at_idx\` ON \`_student_services_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_snapshot_idx\` ON \`_student_services_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_published_locale_idx\` ON \`_student_services_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_student_services_v_latest_idx\` ON \`_student_services_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_student_services_v_locales_locale_parent_id_unique\` ON \`_student_services_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_student_services_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_stats_order_idx\` ON \`about_gtni_stats\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_stats_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_stats_parent_id_idx\` ON \`about_gtni_stats\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_stats_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_stats_locales_locale_parent_id_unique\` ON \`about_gtni_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_stats_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_leadership_members_order_idx\` ON \`about_gtni_leadership_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_leadership_members_parent_id_idx\` ON \`about_gtni_leadership_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_leadership_members_photo_idx\` ON \`about_gtni_leadership_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_leadership_members_locales_locale_parent_id_uniqu\` ON \`about_gtni_leadership_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_leadership_members_locales_locale_parent_id_uniqu skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_other_members_order_idx\` ON \`about_gtni_other_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_other_members_parent_id_idx\` ON \`about_gtni_other_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_other_members_photo_idx\` ON \`about_gtni_other_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_other_members_locales_locale_parent_id_unique\` ON \`about_gtni_other_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_other_members_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_faculty_members_order_idx\` ON \`about_gtni_faculty_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_faculty_members_parent_id_idx\` ON \`about_gtni_faculty_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_faculty_members_photo_idx\` ON \`about_gtni_faculty_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_faculty_members_locales_locale_parent_id_unique\` ON \`about_gtni_faculty_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_faculty_members_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_order_idx\` ON \`about_gtni_admin_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_parent_id_idx\` ON \`about_gtni_admin_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_admin_members_photo_idx\` ON \`about_gtni_admin_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_admin_members_locales_locale_parent_id_unique\` ON \`about_gtni_admin_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_admin_members_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_hero_image_idx\` ON \`about_gtni\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_video_idx\` ON \`about_gtni\` (\`video_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_video_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni_philosophy_image_idx\` ON \`about_gtni\` (\`philosophy_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_philosophy_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`about_gtni__status_idx\` ON \`about_gtni\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`about_gtni_locales_locale_parent_id_unique\` ON \`about_gtni_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`about_gtni_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_stats_order_idx\` ON \`_about_gtni_v_version_stats\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_stats_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_stats_parent_id_idx\` ON \`_about_gtni_v_version_stats\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_stats_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_version_stats_locales_locale_parent_id_unique\` ON \`_about_gtni_v_version_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_stats_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_leadership_members_order_idx\` ON \`_about_gtni_v_version_leadership_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_leadership_members_parent_id_idx\` ON \`_about_gtni_v_version_leadership_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_leadership_members_photo_idx\` ON \`_about_gtni_v_version_leadership_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_version_leadership_members_locales_locale_pare\` ON \`_about_gtni_v_version_leadership_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_leadership_members_locales_locale_pare skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_other_members_order_idx\` ON \`_about_gtni_v_version_other_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_other_members_parent_id_idx\` ON \`_about_gtni_v_version_other_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_other_members_photo_idx\` ON \`_about_gtni_v_version_other_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_version_other_members_locales_locale_parent_id\` ON \`_about_gtni_v_version_other_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_other_members_locales_locale_parent_id skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_faculty_members_order_idx\` ON \`_about_gtni_v_version_faculty_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_faculty_members_parent_id_idx\` ON \`_about_gtni_v_version_faculty_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_faculty_members_photo_idx\` ON \`_about_gtni_v_version_faculty_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_version_faculty_members_locales_locale_parent_\` ON \`_about_gtni_v_version_faculty_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_faculty_members_locales_locale_parent_ skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_admin_members_order_idx\` ON \`_about_gtni_v_version_admin_members\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_admin_members_parent_id_idx\` ON \`_about_gtni_v_version_admin_members\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_admin_members_photo_idx\` ON \`_about_gtni_v_version_admin_members\` (\`photo_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members_photo_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_version_admin_members_locales_locale_parent_id\` ON \`_about_gtni_v_version_admin_members_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_admin_members_locales_locale_parent_id skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_version_hero_image_idx\` ON \`_about_gtni_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_version_video_idx\` ON \`_about_gtni_v\` (\`version_video_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_version_video_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_version_philosophy_image_idx\` ON \`_about_gtni_v\` (\`version_philosophy_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_version_philosophy_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_version_version__status_idx\` ON \`_about_gtni_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_created_at_idx\` ON \`_about_gtni_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_updated_at_idx\` ON \`_about_gtni_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_snapshot_idx\` ON \`_about_gtni_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_published_locale_idx\` ON \`_about_gtni_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_about_gtni_v_latest_idx\` ON \`_about_gtni_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_about_gtni_v_locales_locale_parent_id_unique\` ON \`_about_gtni_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_about_gtni_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs_epslos_categories_order_idx\` ON \`nursing_programs_epslos_categories\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs_epslos_categories_parent_id_idx\` ON \`nursing_programs_epslos_categories\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs_epslos_categories_image_idx\` ON \`nursing_programs_epslos_categories\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`nursing_programs_epslos_categories_locales_locale_parent_id_\` ON \`nursing_programs_epslos_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_epslos_categories_locales_locale_parent_id_ skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs_hero_image_idx\` ON \`nursing_programs\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs_courses_section_courses_section_image_idx\` ON \`nursing_programs\` (\`courses_section_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_courses_section_courses_section_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`nursing_programs__status_idx\` ON \`nursing_programs\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`nursing_programs_locales_locale_parent_id_unique\` ON \`nursing_programs_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`nursing_programs_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories_order_idx\` ON \`_nursing_programs_v_version_epslos_categories\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories_parent_id_idx\` ON \`_nursing_programs_v_version_epslos_categories\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories_image_idx\` ON \`_nursing_programs_v_version_epslos_categories\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_nursing_programs_v_version_epslos_categories_locales_locale\` ON \`_nursing_programs_v_version_epslos_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_epslos_categories_locales_locale skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_version_hero_image_idx\` ON \`_nursing_programs_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_courses_section_version_cour_idx\` ON \`_nursing_programs_v\` (\`version_courses_section_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_courses_section_version_cour_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_version_version__status_idx\` ON \`_nursing_programs_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_created_at_idx\` ON \`_nursing_programs_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_updated_at_idx\` ON \`_nursing_programs_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_snapshot_idx\` ON \`_nursing_programs_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_published_locale_idx\` ON \`_nursing_programs_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_nursing_programs_v_latest_idx\` ON \`_nursing_programs_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_nursing_programs_v_locales_locale_parent_id_unique\` ON \`_nursing_programs_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_nursing_programs_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_blocks_scholarship_section_order_idx\` ON \`scholarships_blocks_scholarship_section\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_blocks_scholarship_section_parent_id_idx\` ON \`scholarships_blocks_scholarship_section\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_blocks_scholarship_section_path_idx\` ON \`scholarships_blocks_scholarship_section\` (\`_path\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_blocks_scholarship_section_image_idx\` ON \`scholarships_blocks_scholarship_section\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`scholarships_blocks_scholarship_section_locales_locale_paren\` ON \`scholarships_blocks_scholarship_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_blocks_scholarship_section_locales_locale_paren skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`acc_fac_images_order_idx\` ON \`acc_fac_images\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`acc_fac_images_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`acc_fac_images_parent_id_idx\` ON \`acc_fac_images\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`acc_fac_images_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`acc_fac_images_image_idx\` ON \`acc_fac_images\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`acc_fac_images_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_facilities_sections_order_idx\` ON \`scholarships_facilities_sections\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_facilities_sections_parent_id_idx\` ON \`scholarships_facilities_sections\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_facilities_sections_main_image_idx\` ON \`scholarships_facilities_sections\` (\`main_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections_main_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`scholarships_facilities_sections_locales_locale_parent_id_un\` ON \`scholarships_facilities_sections_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_facilities_sections_locales_locale_parent_id_un skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_hero_image_idx\` ON \`scholarships\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships_accommodation_image_idx\` ON \`scholarships\` (\`accommodation_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_accommodation_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`scholarships__status_idx\` ON \`scholarships\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`scholarships_locales_locale_parent_id_unique\` ON \`scholarships_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`scholarships_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_order_idx\` ON \`_scholarships_v_blocks_scholarship_section\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_parent_id_idx\` ON \`_scholarships_v_blocks_scholarship_section\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_path_idx\` ON \`_scholarships_v_blocks_scholarship_section\` (\`_path\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_path_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_image_idx\` ON \`_scholarships_v_blocks_scholarship_section\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_scholarships_v_blocks_scholarship_section_locales_locale_pa\` ON \`_scholarships_v_blocks_scholarship_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_blocks_scholarship_section_locales_locale_pa skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_acc_fac_images_v_order_idx\` ON \`_acc_fac_images_v\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_acc_fac_images_v_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_acc_fac_images_v_parent_id_idx\` ON \`_acc_fac_images_v\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_acc_fac_images_v_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_acc_fac_images_v_image_idx\` ON \`_acc_fac_images_v\` (\`image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_acc_fac_images_v_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_facilities_sections_order_idx\` ON \`_scholarships_v_version_facilities_sections\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_facilities_sections_parent_id_idx\` ON \`_scholarships_v_version_facilities_sections\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_facilities_sections_main_image_idx\` ON \`_scholarships_v_version_facilities_sections\` (\`main_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections_main_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_scholarships_v_version_facilities_sections_locales_locale_p\` ON \`_scholarships_v_version_facilities_sections_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_facilities_sections_locales_locale_p skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_version_hero_image_idx\` ON \`_scholarships_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_version_accommodation_image_idx\` ON \`_scholarships_v\` (\`version_accommodation_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_version_accommodation_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_version_version__status_idx\` ON \`_scholarships_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_created_at_idx\` ON \`_scholarships_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_updated_at_idx\` ON \`_scholarships_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_snapshot_idx\` ON \`_scholarships_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_published_locale_idx\` ON \`_scholarships_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_scholarships_v_latest_idx\` ON \`_scholarships_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_scholarships_v_locales_locale_parent_id_unique\` ON \`_scholarships_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_scholarships_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_admission_decision_aspects_order_idx\` ON \`admission_admission_decision_aspects\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_admission_decision_aspects_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_admission_decision_aspects_parent_id_idx\` ON \`admission_admission_decision_aspects\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_admission_decision_aspects_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_admission_decision_aspects_locales_locale_parent_i\` ON \`admission_admission_decision_aspects_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_admission_decision_aspects_locales_locale_parent_i skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_requirements_list_order_idx\` ON \`admission_requirements_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_requirements_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_requirements_list_parent_id_idx\` ON \`admission_requirements_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_requirements_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_requirements_list_locales_locale_parent_id_unique\` ON \`admission_requirements_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_requirements_list_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_submission_list_order_idx\` ON \`admission_submission_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_submission_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_submission_list_parent_id_idx\` ON \`admission_submission_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_submission_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_submission_list_locales_locale_parent_id_unique\` ON \`admission_submission_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_submission_list_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_application_steps_list_order_idx\` ON \`admission_application_steps_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_application_steps_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_application_steps_list_parent_id_idx\` ON \`admission_application_steps_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_application_steps_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_application_steps_list_locales_locale_parent_id_un\` ON \`admission_application_steps_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_application_steps_list_locales_locale_parent_id_un skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_domains_list_order_idx\` ON \`admission_domains_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_domains_list_parent_id_idx\` ON \`admission_domains_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_domains_list_locales_locale_parent_id_unique\` ON \`admission_domains_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_list_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_hero_image_idx\` ON \`admission\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_steps_image_desktop_idx\` ON \`admission\` (\`steps_image_desktop_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_steps_image_desktop_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_steps_image_mobile_idx\` ON \`admission\` (\`steps_image_mobile_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_steps_image_mobile_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission_domains_image_idx\` ON \`admission\` (\`domains_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_domains_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`admission__status_idx\` ON \`admission\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`admission__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`admission_locales_locale_parent_id_unique\` ON \`admission_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`admission_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_admission_decision_aspects_order_idx\` ON \`_admission_v_version_admission_decision_aspects\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_admission_decision_aspects_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_admission_decision_aspects_parent_id_idx\` ON \`_admission_v_version_admission_decision_aspects\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_admission_decision_aspects_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_version_admission_decision_aspects_locales_loca\` ON \`_admission_v_version_admission_decision_aspects_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_admission_decision_aspects_locales_loca skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_requirements_list_order_idx\` ON \`_admission_v_version_requirements_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_requirements_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_requirements_list_parent_id_idx\` ON \`_admission_v_version_requirements_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_requirements_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_version_requirements_list_locales_locale_parent\` ON \`_admission_v_version_requirements_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_requirements_list_locales_locale_parent skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_submission_list_order_idx\` ON \`_admission_v_version_submission_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_submission_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_submission_list_parent_id_idx\` ON \`_admission_v_version_submission_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_submission_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_version_submission_list_locales_locale_parent_i\` ON \`_admission_v_version_submission_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_submission_list_locales_locale_parent_i skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_application_steps_list_order_idx\` ON \`_admission_v_version_application_steps_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_application_steps_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_application_steps_list_parent_id_idx\` ON \`_admission_v_version_application_steps_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_application_steps_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_version_application_steps_list_locales_locale_p\` ON \`_admission_v_version_application_steps_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_application_steps_list_locales_locale_p skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_domains_list_order_idx\` ON \`_admission_v_version_domains_list\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_domains_list_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_domains_list_parent_id_idx\` ON \`_admission_v_version_domains_list\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_domains_list_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_version_domains_list_locales_locale_parent_id_u\` ON \`_admission_v_version_domains_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_domains_list_locales_locale_parent_id_u skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_version_hero_image_idx\` ON \`_admission_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_version_steps_image_desktop_idx\` ON \`_admission_v\` (\`version_steps_image_desktop_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_version_steps_image_desktop_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_version_steps_image_mobile_idx\` ON \`_admission_v\` (\`version_steps_image_mobile_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_version_steps_image_mobile_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_version_domains_image_idx\` ON \`_admission_v\` (\`version_domains_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_version_domains_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_version_version__status_idx\` ON \`_admission_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_created_at_idx\` ON \`_admission_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_updated_at_idx\` ON \`_admission_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_snapshot_idx\` ON \`_admission_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_published_locale_idx\` ON \`_admission_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_admission_v_latest_idx\` ON \`_admission_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_admission_v_locales_locale_parent_id_unique\` ON \`_admission_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_admission_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`vacancies_positions_order_idx\` ON \`vacancies_positions\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_positions_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`vacancies_positions_parent_id_idx\` ON \`vacancies_positions\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_positions_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`vacancies_positions_locales_locale_parent_id_unique\` ON \`vacancies_positions_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_positions_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`vacancies_hero_image_idx\` ON \`vacancies\` (\`hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`vacancies__status_idx\` ON \`vacancies\` (\`_status\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`vacancies_locales_locale_parent_id_unique\` ON \`vacancies_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`vacancies_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_version_positions_order_idx\` ON \`_vacancies_v_version_positions\` (\`_order\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_positions_order_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_version_positions_parent_id_idx\` ON \`_vacancies_v_version_positions\` (\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_positions_parent_id_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_vacancies_v_version_positions_locales_locale_parent_id_uniq\` ON \`_vacancies_v_version_positions_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_positions_locales_locale_parent_id_uniq skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_version_version_hero_image_idx\` ON \`_vacancies_v\` (\`version_hero_image_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_version_hero_image_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_version_version__status_idx\` ON \`_vacancies_v\` (\`version__status\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_version_version__status_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_created_at_idx\` ON \`_vacancies_v\` (\`created_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_created_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_updated_at_idx\` ON \`_vacancies_v\` (\`updated_at\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_updated_at_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_snapshot_idx\` ON \`_vacancies_v\` (\`snapshot\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_snapshot_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_published_locale_idx\` ON \`_vacancies_v\` (\`published_locale\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_published_locale_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE INDEX IF NOT EXISTS \`_vacancies_v_latest_idx\` ON \`_vacancies_v\` (\`latest\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_latest_idx skipped: ${e.message}`)
  }

  try {
    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_vacancies_v_locales_locale_parent_id_unique\` ON \`_vacancies_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  } catch (e: any) {
    payload.logger.info(`_vacancies_v_locales_locale_parent_id_unique skipped: ${e.message}`)
  }

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`DROP TABLE IF EXISTS \`settings\`;`)
  } catch (e: any) {
    payload.logger.info(`drop settings skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_vacancies_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _vacancies_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_vacancies_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _vacancies_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_vacancies_v_version_positions_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _vacancies_v_version_positions_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_vacancies_v_version_positions\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _vacancies_v_version_positions skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`vacancies_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop vacancies_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`vacancies\`;`)
  } catch (e: any) {
    payload.logger.info(`drop vacancies skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`vacancies_positions_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop vacancies_positions_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`vacancies_positions\`;`)
  } catch (e: any) {
    payload.logger.info(`drop vacancies_positions skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_domains_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_domains_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_domains_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_domains_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_application_steps_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_application_steps_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_application_steps_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_application_steps_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_submission_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_submission_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_submission_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_submission_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_requirements_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_requirements_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_requirements_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_requirements_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_admission_decision_aspects_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_admission_decision_aspects_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_admission_v_version_admission_decision_aspects\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _admission_v_version_admission_decision_aspects skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_domains_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_domains_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_domains_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_domains_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_application_steps_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_application_steps_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_application_steps_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_application_steps_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_submission_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_submission_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_submission_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_submission_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_requirements_list_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_requirements_list_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_requirements_list\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_requirements_list skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_admission_decision_aspects_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_admission_decision_aspects_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`admission_admission_decision_aspects\`;`)
  } catch (e: any) {
    payload.logger.info(`drop admission_admission_decision_aspects skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v_version_facilities_sections_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v_version_facilities_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v_version_facilities_sections\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v_version_facilities_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_acc_fac_images_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _acc_fac_images_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v_blocks_scholarship_section_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v_blocks_scholarship_section_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_scholarships_v_blocks_scholarship_section\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _scholarships_v_blocks_scholarship_section skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships_facilities_sections_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships_facilities_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships_facilities_sections\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships_facilities_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`acc_fac_images\`;`)
  } catch (e: any) {
    payload.logger.info(`drop acc_fac_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships_blocks_scholarship_section_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships_blocks_scholarship_section_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`scholarships_blocks_scholarship_section\`;`)
  } catch (e: any) {
    payload.logger.info(`drop scholarships_blocks_scholarship_section skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_nursing_programs_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _nursing_programs_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_nursing_programs_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _nursing_programs_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_nursing_programs_v_version_epslos_categories_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _nursing_programs_v_version_epslos_categories_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_nursing_programs_v_version_epslos_categories\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _nursing_programs_v_version_epslos_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`nursing_programs_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop nursing_programs_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`nursing_programs\`;`)
  } catch (e: any) {
    payload.logger.info(`drop nursing_programs skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`nursing_programs_epslos_categories_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop nursing_programs_epslos_categories_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`nursing_programs_epslos_categories\`;`)
  } catch (e: any) {
    payload.logger.info(`drop nursing_programs_epslos_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_admin_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_admin_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_admin_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_admin_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_faculty_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_faculty_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_faculty_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_faculty_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_other_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_other_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_other_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_other_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_leadership_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_leadership_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_leadership_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_leadership_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_stats_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_stats_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_about_gtni_v_version_stats\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _about_gtni_v_version_stats skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_admin_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_admin_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_admin_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_admin_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_faculty_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_faculty_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_faculty_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_faculty_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_other_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_other_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_other_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_other_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_leadership_members_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_leadership_members_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_leadership_members\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_leadership_members skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_stats_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_stats_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`about_gtni_stats\`;`)
  } catch (e: any) {
    payload.logger.info(`drop about_gtni_stats skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_version_services_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_version_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_version_services\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_version_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_version_services_table_data_table_rows_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_version_services_table_data_table_rows_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_version_services_table_data_table_rows\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_version_services_table_data_table_rows skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_student_services_v_version_services_service_images\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _student_services_v_version_services_service_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_services_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_services_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_services\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_services skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_services_table_data_table_rows_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_services_table_data_table_rows_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_services_table_data_table_rows\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_services_table_data_table_rows skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`student_services_services_service_images\`;`)
  } catch (e: any) {
    payload.logger.info(`drop student_services_services_service_images skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v_version_semesters_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v_version_semesters_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v_version_semesters\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v_version_semesters skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v_version_semesters_courses_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v_version_semesters_courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_courses_v_version_semesters_courses\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _courses_v_version_semesters_courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses_semesters_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses_semesters_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses_semesters\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses_semesters skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses_semesters_courses_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses_semesters_courses_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`courses_semesters_courses\`;`)
  } catch (e: any) {
    payload.logger.info(`drop courses_semesters_courses skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_footer_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _footer_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_footer_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _footer_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_footer_v_version_quick_links_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _footer_v_version_quick_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_footer_v_version_quick_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _footer_v_version_quick_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_footer_v_version_social_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _footer_v_version_social_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`footer_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop footer_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`footer\`;`)
  } catch (e: any) {
    payload.logger.info(`drop footer skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`footer_quick_links_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop footer_quick_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`footer_quick_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop footer_quick_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`footer_social_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop footer_social_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_global_v_rels\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _news_events_global_v_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_global_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _news_events_global_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_global_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _news_events_global_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_global_v_version_sections_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _news_events_global_v_version_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_news_events_global_v_version_sections\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _news_events_global_v_version_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_rels\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events_global_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events_global_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events_global skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_sections_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events_global_sections_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events_global_sections\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events_global_sections skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_version_testimonials_items_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_version_testimonials_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_version_testimonials_items\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_version_testimonials_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_version_feature_cards_cards_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_version_feature_cards_cards_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_version_feature_cards_cards\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_version_feature_cards_cards skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_home_v_version_hero_slider\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _home_v_version_hero_slider skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_testimonials_items_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_testimonials_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_testimonials_items\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_testimonials_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_feature_cards_cards_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_feature_cards_cards_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_feature_cards_cards\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_feature_cards_cards skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`home_hero_slider\`;`)
  } catch (e: any) {
    payload.logger.info(`drop home_hero_slider skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_header_v\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _header_v skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_header_v_version_login_links_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _header_v_version_login_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_header_v_version_login_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _header_v_version_login_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_header_v_version_nav_items_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _header_v_version_nav_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`_header_v_version_nav_items\`;`)
  } catch (e: any) {
    payload.logger.info(`drop _header_v_version_nav_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`header\`;`)
  } catch (e: any) {
    payload.logger.info(`drop header skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`header_login_links_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop header_login_links_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`header_login_links\`;`)
  } catch (e: any) {
    payload.logger.info(`drop header_login_links skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`header_nav_items_locales\`;`)
  } catch (e: any) {
    payload.logger.info(`drop header_nav_items_locales skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`header_nav_items\`;`)
  } catch (e: any) {
    payload.logger.info(`drop header_nav_items skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_migrations\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_migrations skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_preferences_rels\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_preferences_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_preferences\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_preferences skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_locked_documents_rels\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_locked_documents_rels skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_locked_documents\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_locked_documents skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`payload_kv\`;`)
  } catch (e: any) {
    payload.logger.info(`drop payload_kv skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_events\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_events skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`media_categories\`;`)
  } catch (e: any) {
    payload.logger.info(`drop media_categories skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`news_category\`;`)
  } catch (e: any) {
    payload.logger.info(`drop news_category skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`media\`;`)
  } catch (e: any) {
    payload.logger.info(`drop media skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`users\`;`)
  } catch (e: any) {
    payload.logger.info(`drop users skipped: ${e.message}`)
  }

  try {
    await db.run(sql`DROP TABLE IF EXISTS \`users_sessions\`;`)
  } catch (e: any) {
    payload.logger.info(`drop users_sessions skipped: ${e.message}`)
  }
}
