import { Block, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

// ════════════════════════════════════════════════════════════════════════
// BLOCKS DEFINITIONS
// ════════════════════════════════════════════════════════════════════════

const GtniScholarshipBlock: Block = {
  slug: 'scholarship-section',
  labels: {
    singular: 'Scholarship Section',
    plural: 'Scholarship Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// SCHOLARSHIPS GLOBAL CONFIGURATION
// ════════════════════════════════════════════════════════════════════════

export const Scholarships: GlobalConfig = {
  slug: 'scholarships',
  label: 'Scholarships',
  admin: {
    description: 'Manage Scholarships & Facilities',
    group: 'Pages',
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
        revalidatePath('/scholarships')
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
        description: 'The banner that appears at the top of the Scholarships page',
      },
      fields: [
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              label: 'Page Title',
              localized: true,
              defaultValue: 'Scholarships',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'heroSubtitle',
          type: 'textarea',
          label: 'Subtitle',
          localized: true,
          defaultValue:
            'Discover the services and support available to enhance your journey at GTNI.',
          admin: {
            rows: 2,
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 2: PAGE BLOCKS (REORDERABLE VIA DRAG-AND-DROP)
    // ════════════════════════════════════════════════════════════════════════
    {
      name: 'pageBlocks',
      type: 'blocks',
      label: 'Page Content Blocks',
      minRows: 0,
      blocks: [
        GtniScholarshipBlock,
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 3: ACCOMMODATION (STATIC SECTION, ALWAYS RENDERS AFTER BLOCKS)
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🏠 Accommodation',
      admin: {
        initCollapsed: true,
        description: 'General Accommodation information',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'accommodationTitle',
              type: 'text',
              label: 'Title',
              localized: true,
              defaultValue: 'Accommodation',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'accommodationContent',
          type: 'richText',
          label: 'Accommodation Content',
          localized: true,
        },
        {
          name: 'accommodationImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Accommodation Image',
        },
        {
          type: 'collapsible',
          label: 'Accommodation Facilities',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'accommodationFacilitiesTitle',
              type: 'text',
              label: 'Title',
              localized: true,
              defaultValue: 'Accommodation Facilities',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'accommodationFacilitiesImage',
              type: 'array',
              dbName: 'acc_fac_images',
              minRows: 0,
              maxRows: 4,
              label: 'Facilities Images',
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

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 4: FACILITIES SECTION
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🏢 Facilities Section',
      admin: {
        initCollapsed: false,
        description: 'Manage the Facilities overview, teaching labs, and student resources.',
      },
      fields: [
        {
          name: 'facilitiesSections',
          type: 'array',
          label: 'Facility Categories',
          labels: {
            singular: 'Facility Category',
            plural: 'Facility Categories',
          },
          admin: {
            components: {
              Field: '@/components/payload/C_SectionDrawer#SectionDrawer',
              RowLabel: '@/components/payload/C_RowLabel#C_RowLabel',
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Category Title',
                  required: true,
                  localized: true,
                  admin: { width: '70%' },
                },
              ],
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Category Description',
              required: true,
              localized: true,
            },
            {
              name: 'mainImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Main Showcase Image',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'Apply Button Text',
      localized: true,
    },
    {
      name: 'buttonLink',
      type: 'text',
      label: 'Apply Button Link',
    },
  ],
}
