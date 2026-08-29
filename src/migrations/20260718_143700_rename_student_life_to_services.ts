import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Try to rename tables, catching errors if they were already renamed in a previous partial execution
  try {
    await db.run(sql`ALTER TABLE \`student_life\` RENAME TO \`student_services\`;`)
    payload.logger.info('Renamed table student_life to student_services');
  } catch (e: any) {
    payload.logger.info(`student_life main table rename skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_life_services\` RENAME TO \`student_services_services\`;`)
    payload.logger.info('Renamed table student_life_services to student_services_services');
  } catch (e: any) {
    payload.logger.info(`student_life_services table rename skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_life_services_service_images\` RENAME TO \`student_services_services_service_images\`;`)
    payload.logger.info('Renamed table student_life_services_service_images to student_services_services_service_images');
  } catch (e: any) {
    payload.logger.info(`student_life_services_service_images table rename skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_life_services_table_data_table_rows\` RENAME TO \`student_services_services_table_data_table_rows\`;`)
    payload.logger.info('Renamed table student_life_services_table_data_table_rows to student_services_services_table_data_table_rows');
  } catch (e: any) {
    payload.logger.info(`student_life_services_table_data_table_rows table rename skipped: ${e.message}`);
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  try {
    await db.run(sql`ALTER TABLE \`student_services\` RENAME TO \`student_life\`;`)
  } catch (e: any) {
    payload.logger.info(`Rollback main table skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_services_services\` RENAME TO \`student_life_services\`;`)
  } catch (e: any) {
    payload.logger.info(`Rollback services table skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_services_services_service_images\` RENAME TO \`student_life_services_service_images\`;`)
  } catch (e: any) {
    payload.logger.info(`Rollback service images table skipped: ${e.message}`);
  }

  try {
    await db.run(sql`ALTER TABLE \`student_services_services_table_data_table_rows\` RENAME TO \`student_life_services_table_data_table_rows\`;`)
  } catch (e: any) {
    payload.logger.info(`Rollback table rows table skipped: ${e.message}`);
  }
}
