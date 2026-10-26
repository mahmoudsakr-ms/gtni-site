import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { NewsEventsGlobal } from '@/payload-types'
import type { NewsEventWithResolvedThumbnail } from '@/utilities/video'
import NewsEventsClient from './NewsEventsClient'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { resolveItemThumbnails } from '@/utilities/video'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

interface ResolvedSection {
  title: string
  description: string
  slug: string
  layoutType: 'grid' | 'featured-with-grid' | 'tabs'
  categoryId?: string | number | null
  items: NewsEventWithResolvedThumbnail[]
  stakeholderCats: { id: string | number; name: string }[]
  hasNextPage: boolean
}

interface NewsEventsPageData {
  hero?: NewsEventsGlobal['hero']
  resolvedSections: ResolvedSection[]
  ogImage: string
}

const getNewsEventsPageData = unstable_cache(
  async (locale: string): Promise<NewsEventsPageData> => {
    const payload = await getPayload({ config: configPromise })

    const data = (await payload.findGlobal({
      slug: 'news-events-global',
      depth: 2,
      locale: locale as 'en' | 'ar',
    })) as NewsEventsGlobal

    // Fetch latest news item for OG Image
    const latestNewsRes = await payload.find({
      collection: 'news-events',
      where: { _status: { equals: 'published' } },
      depth: 2,
      limit: 1,
      sort: '-publishedDate',
    })
    const latestNews = latestNewsRes.docs?.[0]

    let ogImage = `${BASE_PATH}/favicon.ico`
    if (
      latestNews?.thumbnail &&
      typeof latestNews.thumbnail === 'object' &&
      'url' in latestNews.thumbnail
    ) {
      ogImage = latestNews.thumbnail.url || ogImage
    }

    const sectionsConfig = data?.sections || []
    const resolvedSections: ResolvedSection[] = []

    for (const sec of sectionsConfig) {
      if (!sec.title) continue

      const sectionId = sec.sectionId || sec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const title = sec.title
      const description = sec.description || ''
      const layoutType = sec.layoutType || 'tabs'

      // Resolve categories assigned to this section
      const categoriesArray = Array.isArray(sec.categories) ? sec.categories : []
      const categoryDocs = categoriesArray.map((cat) => {
        if (typeof cat === 'object' && cat !== null) {
          return { id: cat.id, name: cat.name || '' }
        }
        return { id: cat, name: String(cat) }
      })

      const categoryIds = categoryDocs.map((c) => c.id)

      let items: NewsEventWithResolvedThumbnail[] = []
      let stakeholderCats: { id: string | number; name: string }[] = []
      let hasNextPage = false

      if (categoryIds.length > 0) {
        if (layoutType === 'grid' || layoutType === 'featured-with-grid') {
          const res = await payload.find({
            collection: 'news-events',
            where: {
              and: [
                { itemCategory: { in: categoryIds } },
                { _status: { equals: 'published' } },
              ],
            },
            limit: 100,
            sort: '_order',
          })
          items = await resolveItemThumbnails(res.docs || [])
        } else if (layoutType === 'tabs') {
          stakeholderCats = categoryDocs

          const res = await payload.find({
            collection: 'news-events',
            where: {
              and: [
                { itemCategory: { in: categoryIds } },
                { _status: { equals: 'published' } },
              ],
            },
            limit: 9,
            sort: '_order',
          })
          items = await resolveItemThumbnails(res.docs || [])
          hasNextPage = !!res.hasNextPage
        }
      }

      resolvedSections.push({
        title,
        description,
        slug: sectionId,
        layoutType,
        categoryId: categoryIds[0] || null,
        items,
        stakeholderCats,
        hasNextPage,
      })
    }

    return {
      hero: data?.hero,
      resolvedSections,
      ogImage,
    }
  },
  ['news-events-page-data'],
  {
    tags: ['news-events'],
  }
)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { hero, ogImage } = await getNewsEventsPageData(locale)

  return {
    title: hero?.title || 'News & Events',
    description: hero?.subtitle || 'Stay updated with the latest happenings at GTNI.',
    alternates: buildLocaleAlternates(locale, '/news-events'),
    openGraph: {
      title: hero?.title || 'News & Events',
      description: hero?.subtitle || 'Stay updated with the latest happenings at GTNI.',
      url: '/news-events',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: hero?.title || 'News & Events',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: hero?.title || 'News & Events',
      description: hero?.subtitle || 'Stay updated with the latest happenings at GTNI.',
      images: [ogImage],
    },
  }
}

export default async function NewsEventsPage({ params }: PageProps) {
  const { locale } = await params
  const { hero, resolvedSections } = await getNewsEventsPageData(locale)

  return (
    <NewsEventsClient
      hero={hero}
      sections={resolvedSections}
      locale={locale as 'en' | 'ar'}
    />
  )
}
