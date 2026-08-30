import { getPayload } from 'payload'
import config from '@payload-config'
import type { Scholarship } from '@/payload-types'
import { ScholarshipsClient } from '@/components/ScholarshipsClient'

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'scholarships',
    locale: locale as 'en' | 'ar',
  })) as Scholarship

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : '/favicon.ico'

  return {
    title: data?.heroTitle || '',
    description: data?.heroSubtitle || '',
    alternates: buildLocaleAlternates(locale, '/scholarships'),
    openGraph: {
      title: data?.heroTitle || 'Scholarships',
      description:
        data?.heroSubtitle ||
        'Discover the services and support available to enhance your journey at GTNI.',
      url: '/scholarships',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || '/favicon.ico',
          width: 1200,
          height: 630,
          alt: data?.heroTitle || 'Scholarships',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || 'Scholarships',
      description:
        data?.heroSubtitle ||
        'Discover the services and support available to enhance your journey at GTNI.',
      images: [heroImageUrl || '/favicon.ico'],
    },
  }
}

export default async function ScholarshipsPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'scholarships',
    locale: locale as 'en' | 'ar',
  })) as Scholarship

  return <ScholarshipsClient data={data} />
}
