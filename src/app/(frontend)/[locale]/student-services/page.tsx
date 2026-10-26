import { getPayload } from 'payload'
import config from '@payload-config'
import type { StudentService } from '@/payload-types'
import { StudentServicesClient } from '@/components/StudentServicesClient'

// export const dynamic = 'force-dynamic'
// export const revalidate = 300 // 5 minutes

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config })
  const studentServicesData = (await payload.findGlobal({
    slug: 'student-services',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })) as StudentService

  const heroImageUrl =
    studentServicesData?.heroImage &&
    typeof studentServicesData.heroImage === 'object' &&
    'url' in studentServicesData.heroImage
      ? studentServicesData.heroImage.url
      : `${BASE_PATH}/favicon.ico`

  return {
    title: studentServicesData?.heroTitle || '',
    description: studentServicesData?.heroSubtitle || '',
    alternates: buildLocaleAlternates(locale, '/student-services'),
    openGraph: {
      title: studentServicesData?.heroTitle || 'Student Services | GTNI',
      description:
        studentServicesData?.heroSubtitle ||
        'Discover the services and support available to enhance your journey at GTNI.',
      url: '/student-services',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || `${BASE_PATH}/favicon.ico`,
          width: 1200,
          height: 630,
          alt: studentServicesData?.heroTitle || 'Student Services | GTNI',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: studentServicesData?.heroTitle || 'Student Services | GTNI',
      description:
        studentServicesData?.heroSubtitle ||
        'Discover the services and support available to enhance your journey at GTNI.',
      images: [heroImageUrl || `${BASE_PATH}/favicon.ico`],
    },
  }
}

export default async function StudentServicesPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  const studentServicesData = (await payload.findGlobal({
    slug: 'student-services',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })) as StudentService

  return <StudentServicesClient data={studentServicesData} />
}

// sara moghazi
//mohamed sameh mosaad
