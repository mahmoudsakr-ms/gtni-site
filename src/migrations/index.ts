import * as migration_00000000_000000_initial_schema from './00000000_000000_initial_schema';
import * as migration_20260718_143700_rename_student_life_to_services from './20260718_143700_rename_student_life_to_services';
import * as migration_20260718_153500_scholarships_blocks from './20260718_153500_scholarships_blocks';
import * as migration_20260718_180257 from './20260718_180257';
import * as migration_20260718_180459 from './20260718_180459';
import * as migration_20260718_183336_order_column from './20260718_183336_order_column';
import * as migration_20260718_195906_dynamic_video_sections from './20260718_195906_dynamic_video_sections';
import * as migration_20260718_202015_restore_array_tables from './20260718_202015_restore_array_tables';
import * as migration_20260718_203349_clean_news_events_global_rels from './20260718_203349_clean_news_events_global_rels';
import * as migration_20260720_171800_make_category_id_nullable from './20260720_171800_make_category_id_nullable';
import * as migration_20260720_200829_add_category_tree from './20260720_200829_add_category_tree';
import * as migration_20260721_103049_init_news_sections from './20260721_103049_init_news_sections';
import * as migration_20260721_140000_remove_parent_category_column from './20260721_140000_remove_parent_category_column';
import * as migration_20260721_151000_add_settings from './20260721_151000_add_settings';
import * as migration_20260722_194500_news_events_drafts from './20260722_194500_news_events_drafts';
import * as migration_20260810_134500_add_domains_image_title from './20260810_134500_add_domains_image_title';
import * as migration_20260810_141500_add_testimonial_job_title from './20260810_141500_add_testimonial_job_title';
import * as migration_20260811_125300_add_epslo_category_image from './20260811_125300_add_epslo_category_image';
import * as migration_20260811_132000_remove_nursing_programs_courses_table from './20260811_132000_remove_nursing_programs_courses_table';
import * as migration_20260811_162000_add_admin_members from './20260811_162000_add_admin_members';
import * as migration_20260811_170000_remove_settings_global from './20260811_170000_remove_settings_global';

export const migrations = [
  {
    up: migration_00000000_000000_initial_schema.up,
    down: migration_00000000_000000_initial_schema.down,
    name: '00000000_000000_initial_schema',
  },
  {
    up: migration_20260718_143700_rename_student_life_to_services.up,
    down: migration_20260718_143700_rename_student_life_to_services.down,
    name: '20260718_143700_rename_student_life_to_services',
  },
  {
    up: migration_20260718_153500_scholarships_blocks.up,
    down: migration_20260718_153500_scholarships_blocks.down,
    name: '20260718_153500_scholarships_blocks',
  },
  {
    up: migration_20260718_180257.up,
    down: migration_20260718_180257.down,
    name: '20260718_180257',
  },
  {
    up: migration_20260718_180459.up,
    down: migration_20260718_180459.down,
    name: '20260718_180459',
  },
  {
    up: migration_20260718_183336_order_column.up,
    down: migration_20260718_183336_order_column.down,
    name: '20260718_183336_order_column',
  },
  {
    up: migration_20260718_195906_dynamic_video_sections.up,
    down: migration_20260718_195906_dynamic_video_sections.down,
    name: '20260718_195906_dynamic_video_sections',
  },
  {
    up: migration_20260718_202015_restore_array_tables.up,
    down: migration_20260718_202015_restore_array_tables.down,
    name: '20260718_202015_restore_array_tables',
  },
  {
    up: migration_20260718_203349_clean_news_events_global_rels.up,
    down: migration_20260718_203349_clean_news_events_global_rels.down,
    name: '20260718_203349_clean_news_events_global_rels',
  },
  {
    up: migration_20260720_171800_make_category_id_nullable.up,
    down: migration_20260720_171800_make_category_id_nullable.down,
    name: '20260720_171800_make_category_id_nullable',
  },
  {
    up: migration_20260720_200829_add_category_tree.up,
    down: migration_20260720_200829_add_category_tree.down,
    name: '20260720_200829_add_category_tree',
  },
  {
    up: migration_20260721_103049_init_news_sections.up,
    down: migration_20260721_103049_init_news_sections.down,
    name: '20260721_103049_init_news_sections'
  },
  {
    up: migration_20260721_140000_remove_parent_category_column.up,
    down: migration_20260721_140000_remove_parent_category_column.down,
    name: '20260721_140000_remove_parent_category_column'
  },
  {
    up: migration_20260721_151000_add_settings.up,
    down: migration_20260721_151000_add_settings.down,
    name: '20260721_151000_add_settings'
  },
  {
    up: migration_20260722_194500_news_events_drafts.up,
    down: migration_20260722_194500_news_events_drafts.down,
    name: '20260722_194500_news_events_drafts'
  },
  {
    up: migration_20260810_134500_add_domains_image_title.up,
    down: migration_20260810_134500_add_domains_image_title.down,
    name: '20260810_134500_add_domains_image_title'
  },
  {
    up: migration_20260810_141500_add_testimonial_job_title.up,
    down: migration_20260810_141500_add_testimonial_job_title.down,
    name: '20260810_141500_add_testimonial_job_title'
  },
  {
    up: migration_20260811_125300_add_epslo_category_image.up,
    down: migration_20260811_125300_add_epslo_category_image.down,
    name: '20260811_125300_add_epslo_category_image'
  },
  {
    up: migration_20260811_132000_remove_nursing_programs_courses_table.up,
    down: migration_20260811_132000_remove_nursing_programs_courses_table.down,
    name: '20260811_132000_remove_nursing_programs_courses_table'
  },
  {
    up: migration_20260811_162000_add_admin_members.up,
    down: migration_20260811_162000_add_admin_members.down,
    name: '20260811_162000_add_admin_members'
  },
  {
    up: migration_20260811_170000_remove_settings_global.up,
    down: migration_20260811_170000_remove_settings_global.down,
    name: '20260811_170000_remove_settings_global'
  },
];
