import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const AboutGTNI: GlobalConfig = {
  slug: 'about-gtni',
  label: 'About GTNI',
  admin: {
    group: 'Pages',
    description: 'Manage the About GTNI page content',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/about-gtni')
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
          name: 'type',
          type: 'select',
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Image',
          admin: {
            condition: (_, siblingData) => !siblingData?.type || siblingData?.type === 'image',
          },
        },
        {
          name: 'videoSource',
          type: 'radio',
          defaultValue: 'local',
          options: [
            { label: 'Local MP4 (Uploaded)', value: 'local' },
            { label: 'YouTube Video (Embed)', value: 'external' },
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
          label: 'YouTube Video URL',
          admin: {
            condition: (_, siblingData) =>
              siblingData?.type === 'video' && siblingData?.videoSource === 'external',
          },
        },
        {
          name: 'heroTitle',
          type: 'text',
          label: 'Hero Title',
          maxLength: 100,
          defaultValue: 'About GTNI',
          admin: {
            components: {
              Field: '@/components/payload/Fields/TextField',
            },
          },
        },
        {
          name: 'heroSubtitle',
          type: 'textarea',
          label: 'Hero Subtitle',
          admin: {
            components: {
              Field: '@/components/payload/Fields/TextareaField',
            },
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // MISSION & VISION SECTION
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '🎯 Mission & Vision',
      admin: {
        initCollapsed: true,
        components: {
          Field: '@/components/payload/Fields/DrawerField',
        },
      },
      fields: [
        {
          name: 'mission',
          type: 'richText',
          label: 'Our Mission',
          admin: {
            description: 'The mission statement of GTNI',
          },
        },
        {
          name: 'vision',
          type: 'richText',
          label: 'Our Vision',
          admin: {
            description: 'The vision statement of GTNI',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PHILOSOPHY SECTION
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '📚 Academic Philosophy',
      admin: {
        initCollapsed: true,
        components: {
          Field: '@/components/payload/Fields/DrawerField',
        },
      },
      fields: [
        {
          name: 'philosophyTitle',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'Academic Philosophy',
          admin: {
            components: {
              Field: '@/components/payload/Fields/TextField',
            },
          },
        },
        {
          name: 'philosophyContent',
          type: 'richText',
          label: 'Philosophy Content',
        },
        {
          name: 'philosophyImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Philosophy Image',
        },
      ],
    },

    // ============================================
    // STATS SECTION (GTNI IN NUMBERS)
    // ============================================
    {
      type: 'collapsible',
      label: '📊 GTNI In Numbers',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'GTNI In Numbers',
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Statistics',
          labels: {
            singular: 'Stat',
            plural: 'Stats',
          },
          minRows: 1,
          maxRows: 4,
          admin: {
            components: {
              Field: '@/components/payload/C_SectionDrawer#SectionDrawer',
              RowLabel: '@/components/payload/C_RowLabel#C_RowLabel',
            },
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Stat Label (e.g., Number of Graduates)',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Stat Value (e.g., 500+)',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description (optional)',
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // LEADERSHIP SECTION
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '👥 Board Members',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'leadershipTitle',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'Board Members',
        },
        {
          name: 'leadershipMembers',
          type: 'array',
          label: 'Board Members',
          labels: {
            singular: 'Member',
            plural: 'Members',
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
                  name: 'name',
                  type: 'text',
                  label: 'Full Name',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'role',
                  type: 'text',
                  label: 'Designation / Role',
                  admin: {
                    width: '50%',
                    placeholder: 'e.g., Director, Faculty Member',
                  },
                },
              ],
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile Photo',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Short Bio',
              admin: {
                rows: 4,
              },
            },
          ],
        },
      ],
    },
    // ============================================================================
    //  LEADERSHIP SECTION
    // ============================================================================
    {
      type: 'collapsible',
      label: 'Leadership',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'otherTitle',
          type: 'text',
          label: 'Section Title',
          index: false,
        },
        {
          name: 'otherMembers',
          type: 'array',
          label: 'Leadership',
          labels: {
            singular: 'Member',
            plural: 'Members',
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
                  name: 'name',
                  type: 'text',
                  label: 'Full Name',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'role',
                  type: 'text',
                  label: 'Designation / Role',
                  admin: {
                    width: '50%',
                    placeholder: 'e.g., Coordinator, Support Staff',
                  },
                },
              ],
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile Photo',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Short Bio',
              admin: {
                rows: 4,
              },
            },
          ],
        },
      ],
    },
    // ============================================================================
    //  FACULTY  SECTION
    // ============================================================================
    {
      type: 'collapsible',
      label: 'Faculty Members',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'facultyTitle',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'Faculty Members',
          index: false,
        },
        {
          name: 'facultyMembers',
          type: 'array',
          label: 'Faculty Members',
          labels: {
            singular: 'Member',
            plural: 'Members',
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
                  name: 'name',
                  type: 'text',
                  label: 'Full Name',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'role',
                  type: 'text',
                  label: 'Designation / Role',
                  admin: {
                    width: '50%',
                    placeholder: 'e.g., Director, Faculty Member',
                  },
                },
              ],
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile Photo',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Short Bio',
              admin: {
                rows: 4,
              },
            },
          ],
        },
      ],
    },
    // ============================================================================
    //  ADMIN MEMBERS SECTION
    // ============================================================================
    {
      type: 'collapsible',
      label: 'Admin Members',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'adminTitle',
          type: 'text',
          label: 'Section Title',
          index: false,
        },
        {
          name: 'adminMembers',
          type: 'array',
          label: 'Admin Members',
          labels: {
            singular: 'Member',
            plural: 'Members',
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
                  name: 'name',
                  type: 'text',
                  label: 'Full Name',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'role',
                  type: 'text',
                  label: 'Designation / Role',
                  admin: {
                    width: '50%',
                    placeholder: 'e.g., Administrator, Support Staff',
                  },
                },
              ],
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile Photo',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Short Bio',
              admin: {
                rows: 4,
              },
            },
          ],
        },
      ],
    },
  ],
}
