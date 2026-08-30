import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  admin: {
    group: 'Site Wide',
    description: 'Manage logo, navigation links, and login dropdown',
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
        revalidatePath('/', 'layout')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      admin: {
        description: 'Drag to reorder navigation items. Order will reflect in the frontend.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Display Label',
          required: true,
          localized: true,
        },
        {
          name: 'globalPage',
          type: 'select',
          label: 'Link to Page',
          required: true,
          options: [
            { label: 'Home', value: '' },
            { label: 'About GTNI', value: 'about-gtni' },
            { label: 'Student Services', value: 'student-services' },
            { label: 'The Program', value: 'nursing-programs' },
            { label: 'Scholarships', value: 'scholarships' },
            { label: 'Admission', value: 'admission' },
            { label: 'Vacancies', value: 'vacancies' },
            { label: 'News & Events', value: 'news-events' },
            { label: 'Courses', value: 'courses' },
          ],
        },
      ],
    },
    {
      name: 'loginLinks',
      type: 'array',
      label: 'Login Dropdown Links',
      admin: {
        description: 'Links that will appear in the "Login" dropdown in the header.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
