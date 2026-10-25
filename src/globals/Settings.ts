import type { Field, FieldAccess, FieldHook, GlobalConfig } from 'payload'

// Write-only secret field: an authenticated admin can see the (always-blank) input
// and save a NEW value, but the stored value is never returned by any read -- not
// the admin UI's own data-fetch, not the REST/GraphQL API -- EXCEPT trusted
// server-side Local API calls (e.g. the ai-translate route reading the key to
// actually call the provider), which Payload runs with `overrideAccess: true` by
// default. The `afterRead` hook runs before Payload's access-control field-
// stripping and sees that same `overrideAccess` flag, so it blanks the value
// everywhere access control is in effect (admin UI render, REST/GraphQL) while
// passing the real value through for the one trusted internal case. The
// permissive `access.read` only controls whether the Admin UI renders the field at
// all (a field whose read access is denied is omitted from the edit view entirely,
// not just blanked -- a fully unconditional `() => false` here looks "more secure"
// but actually makes the field impossible to set via the admin form).
const canReadIfLoggedIn: FieldAccess = ({ req }) => Boolean(req.user)
const stripUnlessOverridden: FieldHook = ({ overrideAccess, value }) => (overrideAccess ? value : null)
const writeOnlySecretField = {
  access: {
    read: canReadIfLoggedIn,
  },
  hooks: {
    afterRead: [stripUnlessOverridden],
  },
}

// UX-18: a write-only secret field always renders blank in the admin UI, even
// when a value IS stored -- there's no way for an admin to tell "a key is set"
// apart from "nothing was ever configured" without unmasking the real value.
// Fix: a virtual, read-only companion field placed immediately BEFORE each
// secret in the `fields` array. Payload's afterRead hooks run per-field in
// array order against the same mutable sibling-data object, so this status
// field's hook sees the secret's still-raw value (the secret's own
// stripUnlessOverridden hook hasn't run yet) and can derive a safe
// true/false-only string from it ("A value is currently set" / "Not
// configured") -- never the value itself. `virtual: true` means this field
// has no DB column, so nothing is ever persisted for it (no risk of the
// placeholder text getting saved back over the real secret), and it carries
// the same `canReadIfLoggedIn` access as the real fields for defense in depth
// even though the global's own access.read already requires a logged-in user.
const secretStatusField = (secretFieldName: string, label: string): Field => ({
  name: `${secretFieldName}Status`,
  type: 'text',
  label,
  virtual: true,
  access: {
    read: canReadIfLoggedIn,
  },
  admin: {
    readOnly: true,
    description: 'Shows whether a value is currently stored, without revealing it.',
  },
  hooks: {
    afterRead: [
      ({ siblingData }) => {
        const raw = (siblingData as Record<string, unknown> | undefined)?.[secretFieldName]
        return typeof raw === 'string' && raw.trim().length > 0
          ? '✓ A value is currently set (hidden)'
          : 'Not configured'
      },
    ],
  },
})

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
            secretStatusField('smtpPass', 'SMTP Password Status'),
            {
              name: 'smtpPass',
              type: 'text',
              label: 'SMTP Password',
              ...writeOnlySecretField,
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
            secretStatusField('resendApiKey', 'Resend API Key Status'),
            {
              name: 'resendApiKey',
              type: 'text',
              label: 'Resend API Key',
              ...writeOnlySecretField,
              admin: {
                description: 'Optional Resend API key (re_...). Used if API provider is preferred over SMTP.',
              },
            },
          ],
        },
        {
          label: 'AI Translation (Google Translate)',
          fields: [
            secretStatusField('googleTranslateApiKey', 'Google Translate API Key Status'),
            {
              name: 'googleTranslateApiKey',
              type: 'text',
              label: 'Google Translate API Key',
              ...writeOnlySecretField,
              admin: {
                description:
                  'API key for the Google Cloud Translation API ("Basic"/v2), used by the "Translate with AI" button on translatable pages. In Google Cloud Console: enable the "Cloud Translation API" on a project, then create an API key (restricting it to that API is recommended).',
              },
            },
          ],
        },
        {
          label: 'AI Translation (Gemini — testing)',
          fields: [
            secretStatusField('geminiApiKey', 'Gemini API Key Status'),
            {
              name: 'geminiApiKey',
              type: 'text',
              label: 'Gemini API Key',
              ...writeOnlySecretField,
              admin: {
                description:
                  'Free-tier Google Gemini API key (from aistudio.google.com/apikey), used by the "Translate with AI" button only when the server has TRANSLATE_PROVIDER=gemini set — a local-testing path, not the production translation provider. Get a key, paste it here, no .env edit needed.',
              },
            },
          ],
        },
      ],
    },
  ],
}
