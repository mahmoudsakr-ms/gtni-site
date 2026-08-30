import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const NursingPrograms: GlobalConfig = {
  slug: 'nursing-programs',
  label: 'The Program',
  admin: {
    group: 'Pages',
    description: 'Manage the Nursing Programs page content',
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
        revalidatePath('/nursing-programs')
        return doc
      },
    ],
  },

  fields: [
    // ════════════════════════════════════════════════════════════════════════
    // HERO SECTION
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🖼️ Hero Section',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Image',
        },
        {
          name: 'heroTitle',
          type: 'text',
          label: 'Hero Title',
          localized: true,
          defaultValue: 'Nursing Programs',
        },
        {
          name: 'heroSubtitle',
          type: 'textarea',
          label: 'Hero Subtitle',
          localized: true,
        },
      ],
    },

    {
      name: 'overview',
      type: 'richText',
      label: 'Program Overview',
      localized: true,
    },

    // ============================================
    // EPSLOs SECTION
    // ============================================
    {
      name: 'epslos',
      type: 'group',
      label: 'EPSLOs (End-of-Program Student Learning Outcomes)',
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'EPSLOs',
        },
        {
          name: 'sectionSubtitle',
          type: 'text',
          label: 'Section Subtitle',
          localized: true,
          defaultValue: 'End-of-Program Student Learning Outcomes',
        },
        // Dynamic Categories Array
        {
          name: 'categories',
          type: 'array',
          label: 'EPSLO Categories',
          admin: {
            description: 'Add, remove, or reorder learning outcome categories as needed.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Category Title',
              localized: true,
              admin: {
                placeholder: 'e.g., KNOWLEDGE & UNDERSTANDING',
              },
            },
            {
              name: 'items',
              type: 'textarea',
              label: 'Learning Outcomes',
              localized: true,
              admin: {
                description:
                  'Write each outcome on a new line. They will be displayed as bullet points.',
                rows: 8,
              },
            },
            {
              type: 'collapsible',
              label: 'EPSLO Image (Optional)',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Image',
                },
              ],
            },
          ],
        },
      ],
    },

    // ============================================
    // COURSES SECTION
    // ============================================
    {
      name: 'coursesSection',
      type: 'group',
      label: 'Courses Section',
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'Courses',
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Courses Description',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Section Image',
        },
        {
          name: 'buttonText',
          type: 'text',
          label: 'Button Text',
          localized: true,
          defaultValue: 'GO TO COURSES',
        },
        {
          name: 'buttonLink',
          type: 'text',
          label: 'Button Link (URL)',
          defaultValue: '/courses',
        },
      ],
    },
  ],
}
