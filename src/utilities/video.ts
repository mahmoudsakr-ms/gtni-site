import type { NewsEvent } from '@/payload-types'

export type NewsEventWithResolvedThumbnail = NewsEvent & {
  resolvedThumbnailUrl?: string
}

/**
 * Checks if YouTube's high-resolution thumbnail exists using a fast server-side HEAD request.
 * Falls back to standard resolution if not available.
 */
export async function verifyYoutubeThumbnail(videoUrl: string): Promise<string> {
  if (!videoUrl) return ''
  
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/)
  if (!ytMatch) return ''
  
  const videoId = ytMatch[1]
  const maxresUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4_000)
  try {
    const response = await fetch(maxresUrl, {
      method: 'HEAD',
      next: { revalidate: 86400 }, // Cache validation for 1 day
      signal: controller.signal,
    })
    if (response.status === 200) {
      return maxresUrl
    }
  } catch (_error) {
    // Silent catch (including abort on timeout), fallback below
  } finally {
    clearTimeout(timer)
  }
  return hqUrl
}

/**
 * Pre-resolves valid thumbnail URLs for a list of news/event items on the server.
 */
export async function resolveItemThumbnails(items: NewsEvent[]): Promise<NewsEventWithResolvedThumbnail[]> {
  return await Promise.all(
    items.map(async (item) => {
      let resolvedThumbnailUrl = ''
      
      if (item.thumbnail && typeof item.thumbnail === 'object' && 'url' in item.thumbnail && item.thumbnail.url) {
        resolvedThumbnailUrl = item.thumbnail.url
      } else if (item.type === 'video' && item.videoUrl) {
        resolvedThumbnailUrl = await verifyYoutubeThumbnail(item.videoUrl)
      }
      
      return {
        ...item,
        resolvedThumbnailUrl,
      }
    })
  )
}
