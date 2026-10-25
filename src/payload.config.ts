import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { withCollectionRevalidate, withGlobalRevalidate } from './utilities/revalidate'
import { withDraftProtection } from './utilities/draftAccess'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { NewsCategory } from './collections/NewsCategory'
import { MediaCategory } from './collections/MediaCategory'
import { NewsEvents } from './collections/NewsEvents'

import { Header } from './globals/Header'
import { Home } from './globals/Home'
import { NewsEvents as NewsEventsGlobal } from './globals/NewsEvents'
import { Footer } from './globals/Footer'
import { CoursesGlobal } from './globals/Courses'
import { StudentServices } from './globals/StudentServices'
import { AboutGTNI } from './globals/AboutGTNI'
import { NursingPrograms } from './globals/NursingPrograms'
import { Scholarships } from './globals/Scholarships'
import { Admission } from './globals/Admission'
import { Vacancies } from './globals/Vacancies'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useResend = Boolean(process.env.RESEND_API_KEY)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: '@/elements/Dashboard#Dashboard',
        },
      },
      beforeLogin: ['@/elements/BeforeLogin#BeforeLogin'],
      graphics: {
        Icon: '@/elements/Logo#Icon',
        Logo: '@/elements/Logo#Logo',
      },
      Nav: '@/elements/Nav#Nav',
    },
    avatar: {
      Component: '@/elements/Avatar#Avatar',
    },
    meta: {
      titleSuffix: ' | GTNI Admin',
      icons: [
        {
          rel: 'icon',
          url: '/favicon.ico?v=2',
        },
        {
          rel: 'shortcut icon',
          url: '/favicon.ico?v=2',
        },
      ],
    },
    theme: 'dark',
  },

  collections: [Users, Media, NewsCategory, MediaCategory, NewsEvents].map(
    withCollectionRevalidate,
  ),
  globals: [
    // SEC-H1: these 11 globals all have versions.drafts enabled and a public
    // access.read -- withDraftProtection closes the unauthenticated draft leak.
    // Settings (below) has no versions/drafts and is intentionally excluded.
    ...[
      Header,
      Home,
      NewsEventsGlobal,
      Footer,
      CoursesGlobal,
      StudentServices,
      AboutGTNI,
      NursingPrograms,
      Scholarships,
      Admission,
      Vacancies,
    ].map(withDraftProtection),
    Settings,
  ].map(withGlobalRevalidate),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Explicit instead of relying on Payload's defaults — scoped to the site's own origin.
  cors: [process.env.NEXT_PUBLIC_SERVER_URL].filter((v): v is string => Boolean(v)),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL].filter((v): v is string => Boolean(v)),
  // Configurable so a parallel deployment on the same domain (e.g. under basePath
  // '/new') can use a distinct cookie name ('payload-new-token' etc.) instead of
  // colliding with the main site's 'payload-token' cookie -- cookies are scoped
  // by domain, not by basePath, so two Payload instances on the same domain would
  // otherwise overwrite each other's session. Defaults to Payload's own default.
  cookiePrefix: process.env.PAYLOAD_COOKIE_PREFIX || 'payload',
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    push: process.env.DATABASE_PUSH === 'true',
  }),

  email: useResend
    ? resendAdapter({
        defaultFromName: process.env.EMAIL_FROM_NAME || 'GTNI Admin',
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@gtni.edu.eg',
        apiKey: process.env.RESEND_API_KEY || '',
      })

    : nodemailerAdapter({
        defaultFromName: process.env.EMAIL_FROM_NAME || 'GTNI Admin',
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@gtni.edu.eg',
        transportOptions: {
          host: process.env.SMTP_HOST || 'smtp.office365.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER || 'noreply@gtni.edu.eg',
            pass: process.env.SMTP_PASS || '',
          },
        },
      }),

  sharp,
  i18n: {
    translations: {
      en: {
        general: {
          payloadSettings: 'Gtni Settings',
        },
      },
    },
  },
  plugins: [],
})
