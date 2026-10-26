import { getPayload } from 'payload'
import config from '@payload-config'
import type { Admission } from '@/payload-types'
import { AdmissionClient } from '@/components/AdmissionClient'

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'admission',
    locale: locale as 'en' | 'ar',
  })) as Admission

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : `${BASE_PATH}/favicon.ico`

  return {
    title: data?.heroTitle || '',
    description: data?.heroDescription || '',
    alternates: buildLocaleAlternates(locale, '/admission'),
    openGraph: {
      title: data?.heroTitle || '',
      description: data?.heroDescription || '',
      url: '/admission',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || `${BASE_PATH}/favicon.ico`,
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
      images: [heroImageUrl || `${BASE_PATH}/favicon.ico`],
    },
  }
}

export default async function AdmissionPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })
  const data = (await payload.findGlobal({
    slug: 'admission',
    locale: locale as 'en' | 'ar',
  })) as Admission

  return <AdmissionClient data={data} />
}
