import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: {
    group: 'System',
    description: 'Configure domain SMTP email server or Resend API for Payload admin password resets',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General Sender Info',
          fields: [
            {
              name: 'emailFromAddress',
              type: 'text',
              label: 'Default From Email Address',
              defaultValue: 'info@gtni.edu.eg',
              admin: {
                description: 'The email address used as sender (e.g. info@gtni.edu.eg)',
              },
            },
            {
              name: 'emailFromName',
              type: 'text',
              label: 'Default From Sender Name',
              defaultValue: 'GTNI Admin',
              admin: {
                description: 'The display name for sent emails (e.g. GTNI Admin)',
              },
            },
          ],
        },
        {
          label: 'Domain SMTP Server Settings',
          fields: [
            {
              name: 'smtpHost',
              type: 'text',
              label: 'SMTP Host',
              defaultValue: 'mail.gtni.edu.eg',
              admin: {
                description: 'Domain SMTP Server Host (e.g. mail.gtni.edu.eg, smtp.gmail.com, or smtp.office365.com)',
              },
            },
            {
              name: 'smtpPort',
              type: 'number',
              label: 'SMTP Port',
              defaultValue: 465,
              admin: {
                description: 'SMTP Port (465 for SSL, 587 for TLS/STARTTLS)',
              },
            },
            {
              name: 'smtpUser',
              type: 'text',
              label: 'SMTP Username / Email',
              defaultValue: 'info@gtni.edu.eg',
              admin: {
                description: 'Domain email username used to authenticate with SMTP server',
              },
            },
            {
              name: 'smtpPass',
              type: 'text',
              label: 'SMTP Password',
              // Write-only: never returned by read/API responses, even to authenticated users.
              access: {
                read: () => false,
              },
              admin: {
                description: 'Password for the domain SMTP email account',
              },
            },
            {
              name: 'smtpSecure',
              type: 'checkbox',
              label: 'Use SSL/TLS (Secure)',
              defaultValue: true,
              admin: {
                description: 'Check for Port 465 SSL. Uncheck for Port 587 TLS.',
              },
            },
          ],
        },
        {
          label: 'Resend API Alternative',
          fields: [
            {
              name: 'resendApiKey',
              type: 'text',
              label: 'Resend API Key',
              // Write-only: never returned by read/API responses, even to authenticated users.
              access: {
                read: () => false,
              },
              admin: {
                description: 'Optional Resend API key (re_...). Used if API provider is preferred over SMTP.',
              },
            },
          ],
        },
        {
          label: 'AI Translation (Google Translate)',
          fields: [
            {
              name: 'googleTranslateApiKey',
              type: 'text',
              label: 'Google Translate API Key',
              // Write-only: never returned by read/API responses, even to authenticated users.
              access: {
                read: () => false,
              },
              admin: {
                description:
                  'API key for the Google Cloud Translation API ("Basic"/v2), used by the "Translate with AI" button on translatable pages. In Google Cloud Console: enable the "Cloud Translation API" on a project, then create an API key (restricting it to that API is recommended).',
              },
            },
          ],
        },
      ],
    },
  ],
}
