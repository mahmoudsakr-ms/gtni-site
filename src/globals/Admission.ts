import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const Admission: GlobalConfig = {
  slug: 'admission',
  label: 'Admission',
  admin: {
    group: 'Pages',
    description: 'Manage Admission 2025-2026 Page Content',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/admission')
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ════════════════════════════════════════════════════════════════════════
        // TAB 1: HERO SECTION
        // ════════════════════════════════════════════════════════════════════════
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              label: 'Hero Title',
              defaultValue: 'ADMISSION 2025-2026',
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              label: 'Hero Description',
              defaultValue:
                'For details and more explanation of the admission process 2025-2026, watch this video:',
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: 'Video URL',
              defaultValue: 'https://www.youtube.com/watch?v=VIDEO_ID',
            },
            {
              name: 'applyButtonText',
              type: 'text',
              label: 'Apply Button Text',
              defaultValue: 'Apply',
            },
            {
              name: 'applyButtonLink',
              type: 'text',
              label: 'Apply Button Link',
              defaultValue: '#',
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Hero Background Image',
            },
          ],
        },

        // ════════════════════════════════════════════════════════════════════════
        // TAB 2: QUALIFICATIONS & DECISION
        // ════════════════════════════════════════════════════════════════════════
        {
          label: 'Qualifications & Decision',
          fields: [
            {
              name: 'qualificationsTitle',
              type: 'text',
              label: 'Qualifications Title',
              defaultValue: 'QUALIFICATIONS FOR SCHOLARSHIP',
            },
            {
              name: 'qualificationsContent',
              type: 'richText',
              label: 'Qualifications Content',
            },
            {
              name: 'admissionDecisionTitle',
              type: 'text',
              label: 'Admission Decision Title',
              defaultValue: 'The admission decision is based on three aspects:',
            },
            {
              name: 'admissionDecisionAspects',
              type: 'array',
              label: 'Decision Aspects',
              fields: [
                {
                  name: 'aspect',
                  type: 'textarea',
                  label: 'Aspect Description',
                },
              ],
            },
          ],
        },

        // ════════════════════════════════════════════════════════════════════════
        // TAB 3: REQUIREMENTS & SUBMISSION
        // ════════════════════════════════════════════════════════════════════════
        {
          label: 'Requirements & Submission',
          fields: [
            {
              name: 'requirementsTitle',
              type: 'text',
              label: 'Requirements Title',
              defaultValue: 'The admission requirements are identified in Close 28 and Close 29...',
            },
            {
              name: 'requirementsList',
              type: 'array',
              label: 'Requirements List',
              fields: [
                {
                  name: 'requirement',
                  type: 'textarea',
                  label: 'Requirement',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'introInfo',
                  type: 'richText',
                  label: 'Intro Info (e.g. GTNI accepts both male...)',
                  admin: {
                    width: '100%',
                  },
                },
              ],
            },
            {
              name: 'submissionTitle',
              type: 'text',
              label: 'Submission Title',
              defaultValue: 'CANDIDATES MUST SUBMIT THE BELOW TO PROVE THE ADMISSION REQUIREMENTS:',
            },
            {
              name: 'submissionList',
              type: 'array',
              label: 'Submission Documents',
              fields: [
                {
                  name: 'document',
                  type: 'text',
                  label: 'Document Name',
                },
              ],
            },
            {
              name: 'applicationStepsTitle',
              type: 'text',
              label: 'Application Steps Title',
              defaultValue: 'FOLLOW THE FOLLOWING STEPS TO APPLY TO THE INSTITUTE.',
            },
            {
              name: 'applicationStepsList',
              type: 'array',
              label: 'Application Steps',
              fields: [
                {
                  name: 'step',
                  type: 'textarea',
                  label: 'Step Description',
                },
              ],
            },
          ],
        },

        // ════════════════════════════════════════════════════════════════════════
        // TAB 3.5: APPLICATION STEPS (VISUAL)
        // ════════════════════════════════════════════════════════════════════════
        {
          label: 'Application Steps (Visual)',
          fields: [
            {
              name: 'stepsTitle',
              type: 'text',
              label: 'Steps Title',
            },
            {
              name: 'stepsImageDesktop',
              type: 'upload',
              relationTo: 'media',
              label: 'Steps Image (Desktop - Landscape)',
            },
            {
              name: 'stepsImageMobile',
              type: 'upload',
              relationTo: 'media',
              label: 'Steps Image (Mobile - Portrait)',
            },
          ],
        },

        // ════════════════════════════════════════════════════════════════════════
        // TAB 4: ESSENTIAL DOMAINS
        // ════════════════════════════════════════════════════════════════════════
        {
          label: 'Professional Domains',
          fields: [
            {
              name: 'domainsTitle',
              type: 'text',
              label: 'Domains Title',
              defaultValue:
                'TO BE A PROFESSIONAL NURSE YOU NEED TO POSSESS THE FOLLOWING ESSENTIAL DOMAINS',
            },
            {
              name: 'domainsImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Side Image',
            },
            {
              name: 'domainsImageTitle',
              type: 'text',
              label: 'Image Title (Overlay)',
              defaultValue: 'Core Competencies',
            },
            {
              name: 'domainsList',
              type: 'array',
              label: 'Domains List',
              fields: [
                {
                  name: 'domainTitle',
                  type: 'text',
                  label: 'Domain Title (e.g. A cognitive ability)',
                },
                {
                  name: 'domainDescription',
                  type: 'textarea',
                  label: 'Domain Description',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
