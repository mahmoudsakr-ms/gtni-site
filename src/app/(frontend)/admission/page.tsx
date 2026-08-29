import { getPayload } from 'payload'
import config from '@payload-config'
import type { Admission } from '@/payload-types'
import { AdmissionClient } from '@/components/AdmissionClient'

import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'admission',
  })) as Admission

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : '/favicon.ico'

  return {
    title: data?.heroTitle || '',
    description: data?.heroDescription || '',
    alternates: {
      canonical: '/admission',
    },
    openGraph: {
      title: data?.heroTitle || '',
      description: data?.heroDescription || '',
      url: '/admission',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || '/favicon.ico',
          width: 1200,
          height: 630,
          alt: data?.heroTitle || '',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || '',
      description: data?.heroDescription || '',
      images: [heroImageUrl || '/favicon.ico'],
    },
  }
}

export default async function AdmissionPage() {
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'admission',
  })) as Admission

  return <AdmissionClient data={data} />
}
