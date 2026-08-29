import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { withCollectionRevalidate, withGlobalRevalidate } from './utilities/revalidate'

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
  ].map(withGlobalRevalidate),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
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
