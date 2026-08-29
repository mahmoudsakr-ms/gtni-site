import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { StudentTestimonialsClient } from '@/components/StudentTestimonialsClient'

import { Home } from '@/payload-types'

export const StudentTestimonials = async () => {
  const payload = await getPayload({ config: configPromise })

  const homeData = (await payload.findGlobal({
    slug: 'home',
    depth: 1,
  })) as Home

  const testimonials = homeData?.testimonials

  if (!testimonials?.enabled) {
    return null
  }

  return (
    <StudentTestimonialsClient
      title={testimonials.title ?? undefined}
      items={
        (testimonials.items as NonNullable<Home['testimonials']>['items'])?.map((item) => ({
          ...item,
          id: item.id || '',
          image:
            item.image && typeof item.image === 'object' && 'url' in item.image
              ? { url: item.image.url!, alt: item.image.alt || undefined }
              : { url: '', alt: undefined },
          studentName: item.studentName || undefined,
        })) || []
      }
    />
  )
}
