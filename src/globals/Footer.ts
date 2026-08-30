import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Site Wide',
    description: 'Manage footer logo, description, social links, quick links, and contact info',
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
      label: 'Footer Logo',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Footer Description',
      localized: true,
      defaultValue:
        'Empowering students to achieve their dreams through world-class education and a supportive community.',
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
        },
      ],
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: 'Quick Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'globalPage',
          type: 'select',
          label: 'Link to Page',
          required: true,
          options: [
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
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Physical Address',
          localized: true,
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email Address',
        },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Copyright Text',
      localized: true,
      defaultValue: '© 2026 GTNI. All rights reserved.',
    },
  ],
}
