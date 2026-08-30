import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COURSES PAGE GLOBAL
 * ═══════════════════════════════════════════════════════════════════════════
 * Organized into clear sections for easy admin management:
 *
 * 1. Hero Section - Page banner
 * 2. Overview Section - Curriculum description
 * 3. Credit Hours System - Credit rules
 * 4. Semesters - 6 semesters with detailed course tables
 * 5. Graduation Requirements
 * 6. Call to Action
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CoursesGlobal: GlobalConfig = {
  slug: 'courses',
  label: 'Courses',
  admin: {
    description: 'Manage the Courses page - semesters, curriculum, and course details',
    group: 'Pages',
    components: {
      elements: {
        beforeDocumentControls: ['@/components/payload/TranslateButton#TranslateButton'],
      },
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/courses')
        return doc
      },
    ],
  },
  fields: [
    // ════════════════════════════════════════════════════════════════════════
    // SECTION 1: HERO
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🎯 Hero Section',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
        },
        {
          name: 'heroTitle',
          type: 'text',
          label: 'Page Title',
          localized: true,
          defaultValue: 'Our Courses',
        },
        {
          name: 'heroSubtitle',
          type: 'textarea',
          label: 'Subtitle',
          localized: true,
          defaultValue: 'Competency-based curriculum designed for nursing excellence',
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 2: OVERVIEW
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '📚 Curriculum Overview',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'overviewTitle',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'Competency-Based Curriculum',
        },
        {
          name: 'overviewContent',
          type: 'richText',
          label: 'Overview Description',
          localized: true,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 3: CREDIT HOURS SYSTEM
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '⏱️ Credit Hours System',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'creditHoursTitle',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'Credit Hours System',
        },
        {
          name: 'creditHoursDescription',
          type: 'textarea',
          label: 'Introduction',
          localized: true,
          defaultValue:
            'GTNI works on a credit hours system. The Cumulative Grade Point Average (GPA) begins with NU101 Semester.',
        },
        {
          name: 'creditHoursRules',
          type: 'textarea',
          label: 'Credit Hour Rules',
          localized: true,
          admin: {
            description: 'Enter each rule on a new line. They will be displayed as bullet points.',
            rows: 5,
          },
          defaultValue: `1 hour of classroom instruction/week = 1 course credit
2 hours of non-nursing course laboratory/week = 1 course credit
3 hours of nursing course clinical laboratory/week = 1 course credit`,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 4: SEMESTERS (6 Tabs)
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '📅 Semesters & Courses (6 Tabs)',
      admin: {
        initCollapsed: false,
        description: 'Add all 6 semesters with their courses table',
      },
      fields: [
        {
          name: 'semesters',
          type: 'array',
          label: 'Semesters',
          labels: {
            singular: 'Semester',
            plural: 'Semesters',
          },
          admin: {
            initCollapsed: true,
            description: 'Each semester will appear as a tab on the page',
          },
          fields: [
            // Semester Header Info
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: 'Semester Name',
                  localized: true,
                  admin: {
                    placeholder: 'e.g., PREPARATORY SEMESTER',
                    width: '50%',
                  },
                },
                {
                  name: 'weeks',
                  type: 'number',
                  label: 'Duration (Weeks)',
                  defaultValue: 15,
                  admin: {
                    width: '25%',
                  },
                },
                {
                  name: 'tabLabel',
                  type: 'text',
                  label: 'Tab Label (Short)',
                  localized: true,
                  admin: {
                    placeholder: 'e.g., Preparatory',
                    width: '25%',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Semester Description',
              localized: true,
              admin: {
                rows: 3,
                placeholder: 'Describe what students will learn in this semester...',
              },
            },
            // Courses Table
            {
              name: 'courses',
              type: 'array',
              label: 'Courses Table',
              labels: {
                singular: 'Course',
                plural: 'Courses',
              },
              admin: {
                initCollapsed: false,
                description: 'Add all courses for this semester',
              },
              fields: [
                // Row 1: Code, Title
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'courseCode',
                      type: 'text',
                      required: true,
                      label: 'Course Code',
                      admin: {
                        placeholder: 'EN101',
                        width: '20%',
                      },
                    },
                    {
                      name: 'courseTitle',
                      type: 'text',
                      required: true,
                      label: 'Course Title',
                      localized: true,
                      admin: {
                        placeholder: 'English Language',
                        width: '80%',
                      },
                    },
                  ],
                },
                // Hidden field for database compatibility
                {
                  name: 'courseName',
                  type: 'text',
                  required: true,
                  defaultValue: 'Course',
                  admin: {
                    hidden: true,
                  },
                  hooks: {
                    beforeChange: [
                      ({ siblingData }) => {
                        // Auto-fill from courseCode
                        return siblingData?.courseCode || 'Course'
                      },
                    ],
                  },
                },
                // Row 2: Hours
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'classHours',
                      type: 'number',
                      label: 'Class Hours',
                      defaultValue: 0,
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'clinicalHours',
                      type: 'number',
                      label: 'Clinical Hours',
                      defaultValue: 0,
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'totalCourseHours',
                      type: 'number',
                      label: 'Total Course Hours',
                      defaultValue: 0,
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'totalCredit',
                      type: 'number',
                      label: 'Total Credit',
                      defaultValue: 0,
                      admin: {
                        width: '25%',
                      },
                    },
                  ],
                },
                // Row 3: Prerequisites
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'prerequisites',
                      type: 'text',
                      label: 'Pre-requisites',
                      admin: {
                        placeholder: 'Leave empty if none',
                        width: '50%',
                      },
                    },
                    {
                      name: 'corequisites',
                      type: 'text',
                      label: 'Co-requisites',
                      admin: {
                        placeholder: 'Leave empty if none',
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 5: COMPETENCY-BASED CURRICULUM
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🎓 Competency-Based Curriculum',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'competencyTitle',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'COMPETENCY-BASED CURRICULUM',
        },
        {
          name: 'competencyDescription',
          type: 'textarea',
          label: 'Description',
          localized: true,
          admin: {
            description:
              'Main text for the section. Use Enter (New Line) to split into paragraphs.',
            rows: 6,
          },
          defaultValue:
            'GTNI offers a wide-ranging curriculum which is taken over three years. Each semester, students, accompanied by Clinical Instructors, undertake between 135 and 255 hours of clinical practice in approved hospital settings. Students also carry out clinical consolidation each summer to practice their skills. After successful completion of the academic program, students are required to complete a clinical internship for a period of six months in a leading hospital within Egypt.\n\nFor Graduation students are expected to complete the total course hours of the internship and pass the exit exam with a score of 70% or more.',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'clinicalHoursMin',
              type: 'text',
              label: 'Min Clinical Hours',
              defaultValue: '135',
              admin: { width: '33%' },
            },
            {
              name: 'clinicalHoursMax',
              type: 'text',
              label: 'Max Clinical Hours',
              defaultValue: '255',
              admin: { width: '33%' },
            },
            {
              name: 'clinicalHoursText',
              type: 'text',
              label: 'Clinical Hours Description',
              localized: true,
              defaultValue: 'Hours of clinical practice in approved hospital settings.',
              admin: { width: '34%' },
            },
          ],
        },
      ],
    },
  ],
}
