import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const NewsEvents: GlobalConfig = {
  slug: 'news-events-global',
  label: 'Page Settings',
  admin: {
    group: 'News & Events',
    description: 'Manage news page header and categories list',
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
        revalidatePath('/news-events')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Page Hero',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          defaultValue: 'News & Events',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Stay updated with the latest happenings, academic excellence, and student life at GTNI.',
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Page Sections',
      labels: {
        singular: 'Section',
        plural: 'Sections',
      },
      admin: {
        description:
          'Add, arrange, and configure sections displayed on the News & Events page via Drawer.',
        components: {
          Field: '@/components/payload/C_SectionDrawer#SectionDrawer',
          RowLabel: '@/components/payload/C_RowLabel#C_RowLabel',
        },
      },
      fields: [
        {
          name: 'sectionId',
          type: 'text',
          admin: {
            hidden: true,
          },
          hooks: {
            beforeChange: [
              ({ value, siblingData }) => {
                if (value) return value
                if (siblingData?.title) {
                  return String(siblingData.title)
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                }
                return value
              },
            ],
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Section Title',
          localized: true,
          admin: {
            description: 'Example: "Community of Interest"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Section Introductory Description',
          localized: true,
          admin: {
            description: 'Optional. Text displayed directly under section title.',
          },
        },
        {
          name: 'layoutType',
          type: 'select',
          required: true,
          defaultValue: 'tabs',
          label: 'Display Layout Type',
          options: [
            { label: 'Category Tab Filter (Multiple Tabs)', value: 'tabs' },
            { label: 'Featured Video + Video Grid', value: 'featured-with-grid' },
            { label: 'Standard Video Grid', value: 'grid' },
          ],
        },
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'news-category',
          hasMany: true,
          label: 'Categories / Tabs in this Section',
          admin: {
            description: 'Select categories that will act as filter tabs for this section.',
          },
        },
      ],
    },
  ],
}
