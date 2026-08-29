import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STUDENT SERVICES GLOBAL
 * ═══════════════════════════════════════════════════════════════════════════
 * Manages Student Services Guidelines and Policies.
 *
 * Sections:
 * 1. Hero Section - Page banner
 * 2. Policy Info - Category, Name, Purpose
 * 3. Student Services - List of services with descriptions and tables
 * 4. Approval Metadata - Review and approval dates
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const StudentServices: GlobalConfig = {
  slug: 'student-services',
  label: 'Student Services',
  admin: {
    description: 'Manage Student Services, Guidelines, and Policies',
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/student-services')
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
        description: 'The banner that appears at the top of the Student Services page',
      },
      fields: [
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
          admin: {
            description:
              'Upload a high-quality image for the hero banner (recommended: 1920x800px)',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              label: 'Page Title',
              defaultValue: 'Student Services',
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
          defaultValue:
            'Discover the services and support available to enhance your journey at GTNI.',
          admin: {
            description: 'A short description that appears below the title',
            rows: 2,
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 2: OVERVIEW section
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: 'Student Services Overview',
      admin: {
        initCollapsed: true,
        description: 'General Student Services Overview information',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'overviewCategory',
              type: 'text',
              label: 'Overview Title',
              defaultValue: 'Student Services Overview',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'studentServicesListTitle',
              type: 'text',
              label: 'Student Services List Title',
              defaultValue: 'Student Services List',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'purpose',
          type: 'richText',
          label: 'Purpose & Objectives',
          admin: {
            description:
              'Content Hint: "GTNI aims to enhance students overall educational experience by providing diverse student services that cater to their academic, personal, and social needs..."',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 3: STUDENT SERVICES
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: 'Student Services',
      admin: {
        initCollapsed: false,
        description: 'Manage: Language, ICT, Wellbeing, Health, and Academic Advising',
      },
      fields: [
        {
          name: 'services',
          type: 'array',
          label: 'Services List',
          labels: {
            singular: 'Service',
            plural: 'Services',
          },
          admin: {
            description:
              'Add fields for: 1) Language, 2) ICT, 3) Wellbeing, 4) Health, 5) Academic Advising',
            components: {
              RowLabel: '@/components/ServiceRowLabel#ServiceRowLabel',
            },
          },
          fields: [
            // Basic Info
            {
              name: 'serviceName',
              type: 'text',
              label: 'Service Name',
              required: true,
              admin: {
                placeholder: 'e.g., Language Services',
              },
            },
            {
              name: 'serviceImages',
              type: 'array',
              label: 'Service Images (2x2 Grid)',
              minRows: 0,
              maxRows: 4,
              admin: {
                description: 'Upload up to 4 images to display in a 2x2 grid next to the service.',
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

            // Description
            {
              name: 'serviceDescription',
              type: 'richText',
              label: 'Service Description',
              admin: {
                description: 'Provide a detailed description of what this service offers',
              },
            },

            // Additional Note
            {
              name: 'additionalNote',
              type: 'textarea',
              label: 'Additional Note (Optional)',
              admin: {
                description:
                  'Add any extra notes or highlights (appears below the main description)',
                placeholder:
                  'e.g., Advisors communicate with their advisees via emails and through agreed-upon meetings...',
                rows: 4,
              },
            },

            // Table toggle
            {
              name: 'hasTable',
              type: 'checkbox',
              label: '📊 Include a data table for this service?',
              defaultValue: false,
              admin: {
                description:
                  'Enable this to add structured data (e.g., schedule, activities, programs)',
              },
            },
            // Collapsible wrapper for visual collapse
            {
              type: 'collapsible',
              label: '📊 Service Data Table',
              admin: {
                condition: (_, siblingData) => siblingData?.hasTable,
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'tableData',
                  type: 'group',
                  admin: {
                    hideGutter: true,
                  },
                  fields: [
                    {
                      name: 'tableTitle',
                      type: 'text',
                      label: 'Table Title',
                      admin: {
                        placeholder: 'e.g., Language Services Offered',
                      },
                    },
                    // Column Headers Row
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'columnHeader1',
                          type: 'text',
                          label: 'Column 1 Header',
                          admin: {
                            width: '33%',
                            placeholder: 'e.g., Service Name',
                          },
                        },
                        {
                          name: 'columnHeader2',
                          type: 'text',
                          label: 'Column 2 Header',
                          admin: {
                            width: '33%',
                            placeholder: 'e.g., Target Group',
                          },
                        },
                        {
                          name: 'columnHeader3',
                          type: 'text',
                          label: 'Column 3 Header',
                          admin: {
                            width: '33%',
                            placeholder: 'e.g., Course Link (optional)',
                          },
                        },
                      ],
                    },
                    // Table Rows Array
                    {
                      name: 'tableRows',
                      type: 'array',
                      label: 'Table Rows',
                      labels: {
                        singular: 'Row',
                        plural: 'Rows',
                      },
                      admin: {
                        initCollapsed: false,
                        description:
                          'Add each row of data. Each row will have values for the columns defined above.',
                      },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            {
                              name: 'col1',
                              type: 'text',
                              label: 'Column 1 Value',
                              admin: {
                                width: '33%',
                                placeholder: 'e.g., Language Clinic',
                              },
                            },
                            {
                              name: 'col2',
                              type: 'text',
                              label: 'Column 2 Value',
                              admin: {
                                width: '33%',
                                placeholder: 'e.g., Bridge Students',
                              },
                            },
                            {
                              name: 'col3',
                              type: 'text',
                              label: 'Column 3 Value',
                              admin: {
                                width: '33%',
                                placeholder: 'e.g., EN101',
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
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 3:  POLICY section
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: 'Policy Information',
      admin: {
        initCollapsed: true,
        description: 'Manage: Policy Information',
      },
      fields: [
        {
          name: 'policyTitle',
          type: 'text',
          label: 'Policy Title',
          defaultValue: 'Student Policy',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'policyDescription',
          type: 'richText',
          label: 'Policy Description',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'Handbook',
          type: 'upload',
          relationTo: 'media',
          label: 'Handbook',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'handbookUrl',
          type: 'text',
          label: 'Handbook Link URL',
          admin: {
            description: 'External link for the interactive handbook (e.g. Heyzine)',
            width: '100%',
          },
        },
      ],
    },
    // ════════════════════════════════════════════════════════════════════════
    // SECTION 4: APPROVAL METADATA
    // ════════════════════════════════════════════════════════════════════════
    {
      type: 'collapsible',
      label: '✅ Approval Information',
      admin: {
        initCollapsed: true,
        description: 'Document review and approval details for this policy',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'reviewedBy',
              type: 'text',
              label: 'Reviewed By',
              defaultValue: 'Administrative Committee',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'reviewDate',
              type: 'date',
              label: 'Review Date',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'approvedBy',
              type: 'text',
              label: 'Approved By',
              defaultValue: 'Administrative Committee',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'approvalDate',
              type: 'date',
              label: 'Approval Date',
              admin: {
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
}
