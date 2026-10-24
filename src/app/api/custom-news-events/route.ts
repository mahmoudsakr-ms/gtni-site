import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import type { NewsEventsGlobal } from '@/payload-types'
import { resolveItemThumbnails } from '@/utilities/video'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    // SEC-M2: clamp limit server-side -- an unclamped limit (e.g. ?limit=1000000)
    // let a caller force an unbounded, expensive query against news-events.
    const MAX_LIMIT = 50
    const parsedLimit = parseInt(searchParams.get('limit') || '9', 10)
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, MAX_LIMIT) : 9
    const category = searchParams.get('category')
    const rawSearch = searchParams.get('search')
    const search = rawSearch && rawSearch.length <= 200 ? rawSearch : null

    const payload = await getPayload({ config: configPromise })

    const where: Where = {
      _status: { equals: 'published' },
    }

    // 1. Category Filter
    if (category && category !== 'all') {
      const catResult = await payload.find({
        collection: 'news-category',
        where: {
          name: { equals: category },
        },
        limit: 1,
      })

      const catId = catResult.docs[0]?.id
      if (catId) {
        where.itemCategory = { equals: catId }
      } else {
        // If category is not found, return empty list
        return NextResponse.json({ docs: [], totalDocs: 0, hasNextPage: false })
      }
    } else {
      const categoriesParam = searchParams.get('categories')
      let stakeholderIds: (string | number)[] = []

      if (categoriesParam) {
        stakeholderIds = categoriesParam.split(',').map((id) => {
          const num = Number(id)
          return isNaN(num) ? id : num
        })
      } else {
        const globalConfig = (await payload.findGlobal({
          slug: 'news-events-global',
          depth: 2,
        })) as NewsEventsGlobal
        const sections = globalConfig.sections || []
        const tabSection = sections.find((s) => s.layoutType === 'tabs')
        if (tabSection?.categories && Array.isArray(tabSection.categories)) {
          stakeholderIds = tabSection.categories.map((c) => (typeof c === 'object' && c !== null ? c.id : c))
        }
      }

      if (stakeholderIds.length > 0) {
        where.itemCategory = { in: stakeholderIds }
      } else {
        return NextResponse.json({ docs: [], totalDocs: 0, hasNextPage: false })
      }
    }

    // 2. Search Filter
    if (search) {
      where.title = { like: search }
    }

    const result = await payload.find({
      collection: 'news-events',
      depth: 2,
      limit,
      page,
      sort: '_order',
      where,
    })

    const resolvedDocs = await resolveItemThumbnails(result.docs || [])

    return NextResponse.json({
      ...result,
      docs: resolvedDocs,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Error fetching news events API:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
