import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Vacancies: GlobalConfig = {
  slug: 'vacancies',
  label: 'Vacancies',
  admin: {
    group: 'Pages',
    description: 'Manage job vacancies and career opportunities',
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
        revalidatePath('/vacancies')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Hero Title',
      localized: true,
      defaultValue: 'Join the GTNI Family',
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      label: 'Hero Description',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
    },
    {
      name: 'overview',
      type: 'richText',
      label: 'Page Overview',
      localized: true,
    },
    {
      name: 'applicationEmail',
      type: 'email',
      label: 'Application Email',
      defaultValue: 'hr@gtni.edu.eg',
    },
    {
      name: 'positions',
      type: 'array',
      label: 'Open Positions',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'published',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'department',
          type: 'text',
          localized: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Full Time', value: 'full-time' },
            { label: 'Part Time', value: 'part-time' },
            { label: 'Contract', value: 'contract' },
          ],
          defaultValue: 'full-time',
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Job Description',
          localized: true,
        },
        {
          name: 'requirements',
          type: 'textarea',
          label: 'Requirements (Short text)',
          localized: true,
        },
        {
          name: 'deadline',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
      ],
    },
  ],
}
