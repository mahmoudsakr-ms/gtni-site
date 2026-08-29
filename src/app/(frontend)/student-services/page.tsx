import { getPayload } from 'payload'
import config from '@payload-config'
import type { StudentService } from '@/payload-types'
import { StudentServicesClient } from '@/components/StudentServicesClient'

// export const dynamic = 'force-dynamic'
// export const revalidate = 300 // 5 minutes

import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const studentServicesData = (await payload.findGlobal({
    slug: 'student-services',
    depth: 1,
  })) as StudentService

  const heroImageUrl =
    studentServicesData?.heroImage &&
    typeof studentServicesData.heroImage === 'object' &&
    'url' in studentServicesData.heroImage
      ? studentServicesData.heroImage.url
      : '/favicon.ico'

  return {
    title: studentServicesData?.heroTitle || '',
    description: studentServicesData?.heroSubtitle || '',
    alternates: {
      canonical: '/student-services',
    },
    openGraph: {
      title: studentServicesData?.heroTitle || 'Student Services | GTNI',
      description:
        studentServicesData?.heroSubtitle ||
        'Discover the services and support available to enhance your journey at GTNI.',
      url: '/student-services',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || '/favicon.ico',
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
      images: [heroImageUrl || '/favicon.ico'],
    },
  }
}

export default async function StudentServicesPage() {
  const payload = await getPayload({ config })

  const studentServicesData = (await payload.findGlobal({
    slug: 'student-services',
    depth: 1,
  })) as StudentService

  return <StudentServicesClient data={studentServicesData} />
}

// sara moghazi
//mohamed sameh mosaad
