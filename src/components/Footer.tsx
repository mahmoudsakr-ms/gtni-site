import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FooterClient } from '@/components/FooterClient'

import { Footer as FooterType } from '@/payload-types'
import type { AppLocale } from '@/i18n/routing'

export const Footer = async ({ locale }: { locale: AppLocale }) => {
  const payload = await getPayload({ config: configPromise })

  const footerData: FooterType = await payload.findGlobal({
    slug: 'footer',
    depth: 1,
    locale,
  })

  return <FooterClient data={footerData} />
}
