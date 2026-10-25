import { MetadataRoute } from 'next'
import { BASE_PATH, getPublicBaseUrl } from '@/utilities/publicUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [`${BASE_PATH}/admin`, `${BASE_PATH}/api`],
    },
    sitemap: `${getPublicBaseUrl()}/sitemap.xml`,
  }
}
