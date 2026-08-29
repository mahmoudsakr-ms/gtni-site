import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: {
    group: 'Pages',
    description: 'Configure all sections of the homepage',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/')
        return doc
      },
    ],
  },
  fields: [
    // Hero Section
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'video',
          options: [
            { label: 'Video', value: 'video' },
            { label: 'Image Slider', value: 'slider' },
          ],
        },
        {
          name: 'videoSource',
          type: 'radio',
          defaultValue: 'local',
          options: [
            { label: 'Local MP4 (Uploaded)', value: 'local' },
            { label: 'YouTube/External Video (Embed)', value: 'external' },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'video',
          },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Local Video File',
          admin: {
            condition: (_, siblingData) =>
              siblingData?.type === 'video' && siblingData?.videoSource === 'local',
          },
        },
        {
          name: 'externalVideoUrl',
          type: 'text',
          label: 'External Video URL (YouTube)',
          admin: {
            condition: (_, siblingData) =>
              siblingData?.type === 'video' && siblingData?.videoSource === 'external',
          },
        },
        {
          name: 'slider',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'slider',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'subtitle',
          type: 'textarea',
        },
      ],
    },
    // Announcement Section
    {
      name: 'announcement',
      type: 'group',
      label: 'Announcement Banner',
      fields: [
        {
          name: 'line1',
          type: 'text',
          defaultValue: 'BE A PART OF AN EXCITING FUTURE',
        },
        {
          name: 'line2',
          type: 'text',
          defaultValue: 'EDUCATING , INSPIRING , ENABLEING',
        },
      ],
    },
    // Welcome Section
    {
      name: 'welcome',
      type: 'group',
      label: 'Welcome Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Welcome to the Gouna Technical Nursing Institute',
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'signature',
          type: 'text',
          defaultValue: 'Mr., Gouna Technical Nursing Institute',
        },
        {
          name: 'signatureImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Signature or Chairman Image',
        },
      ],
    },
    // Feature Cards Configuration
    {
      name: 'featureCards',
      type: 'group',
      label: 'Feature Cards Section',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Feature Cards Section',
          defaultValue: true,
        },
        {
          name: 'cards',
          type: 'array',
          label: 'Feature Cards',
          maxRows: 6,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
          fields: [
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
            {
              name: 'cardImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Card Background Image',
            },
            {
              name: 'cardTitle',
              type: 'text',
              label: 'Card Title (Optional - uses page title if empty)',
            },
          ],
        },
      ],
    },
    // Student Testimonials Section
    {
      name: 'testimonials',
      type: 'group',
      label: 'Student Testimonials',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Testimonials Section',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'Student Testimonials',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Testimonials',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/payload/C_SectionDrawer#SectionDrawer',
              RowLabel: '@/components/payload/C_RowLabel#C_RowLabel',
            },
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Student Image / Screenshot',
            },
            {
              name: 'studentName',
              type: 'text',
              label: 'Student Name',
            },
            {
              name: 'jobTitle',
              type: 'text',
              label: 'Job Title (e.g. Excellence in Nursing)',
            },
            {
              name: 'quote',
              type: 'textarea',
              label: 'Testimonial Quote',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
