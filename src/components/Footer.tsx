import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FooterClient } from '@/components/FooterClient'

import { Footer as FooterType } from '@/payload-types'

export const Footer = async () => {
  const payload = await getPayload({ config: configPromise })

  const footerData: FooterType = await payload.findGlobal({
    slug: 'footer',
    depth: 1,
  })

  return <FooterClient data={footerData} />
}
