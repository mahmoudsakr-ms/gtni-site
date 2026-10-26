import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Vacancy, Media } from '@/payload-types'
import VacanciesClient from '@/components/VacanciesClient'

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const data = (await payload.findGlobal({
    slug: 'vacancies',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })) as Vacancy

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : `${BASE_PATH}/favicon.ico`

  return {
    title: data?.heroTitle || 'Join the GTNI Family',
    description: data?.heroDescription || 'Explore career opportunities at GTNI.',
    alternates: buildLocaleAlternates(locale, '/vacancies'),
    openGraph: {
      title: data?.heroTitle || 'Join the GTNI Family',
      description: data?.heroDescription || 'Explore career opportunities at GTNI.',
      url: '/vacancies',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || `${BASE_PATH}/favicon.ico`,
          width: 1200,
          height: 630,
          alt: data?.heroTitle || 'Join the GTNI Family',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || 'Join the GTNI Family',
      description: data?.heroDescription || 'Explore career opportunities at GTNI.',
      images: [heroImageUrl || `${BASE_PATH}/favicon.ico`],
    },
  }
}

export default async function VacanciesPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch vacancies global data
  const data = (await payload.findGlobal({
    slug: 'vacancies',
    depth: 2,
    locale: locale as 'en' | 'ar',
  })) as Vacancy

  // Map data to match VacanciesPageData interface
  const clientData = {
    heroTitle: data.heroTitle || undefined,
    heroDescription: data.heroDescription || undefined,
    heroImage: data.heroImage as Media | undefined,
    overview: data.overview || undefined,
    positions:
      data.positions?.map((p) => ({
        ...p,
        id: p.id || undefined,
        department: p.department || undefined,
        requirements: p.requirements || undefined,
        deadline: p.deadline || undefined,
        type: p.type || undefined,
        status: p.status || 'draft', // Ensure literal type match
      })) || undefined,
    applicationEmail: data.applicationEmail || undefined,
  }

  return <VacanciesClient data={clientData} locale={locale as 'en' | 'ar'} />
}
