import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeaturedNewsEventsClient } from './FeaturedNewsEventsClient'
import { resolveItemThumbnails } from '@/utilities/video'

export const FeaturedNewsEvents = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch News & Events Global
  const newsEventsGlobal = await payload.findGlobal({
    slug: 'news-events-global',
    depth: 2,
  })

  // Fetch all items from news-events collection
  const newsItemsRes = await payload.find({
    collection: 'news-events',
    where: { _status: { equals: 'published' } },
    depth: 2,
    limit: 100,
    sort: '_order',
  })

  const rawItems = newsItemsRes.docs || []
  const allItems = await resolveItemThumbnails(rawItems)
  const sectionsConfig = newsEventsGlobal?.sections || []

  const categoriesData = []
  for (const item of sectionsConfig) {
    if (!item.title) continue

    const sectionId = item.sectionId || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const title = item.title
    const showAllButtonText = `Show All ${title}`

    const categoriesArray = Array.isArray(item.categories) ? item.categories : []
    const subCategoryIds = categoriesArray.map((c) => (typeof c === 'object' && c !== null ? c.id : c))

    categoriesData.push({
      id: sectionId,
      name: title,
      slug: sectionId,
      showAllButtonText,
      subCategoryIds,
    })
  }

  if (allItems.length === 0) return null

  return (
    <FeaturedNewsEventsClient
      items={allItems}
      categoriesData={categoriesData}
      hero={newsEventsGlobal?.hero}
    />
  )
}
