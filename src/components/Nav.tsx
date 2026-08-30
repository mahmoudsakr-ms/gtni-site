import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NavClient } from '@/components/NavClient'
import { Header } from '@/payload-types'
import type { AppLocale } from '@/i18n/routing'

export const Nav = async ({ locale }: { locale: AppLocale }) => {
  const payload = await getPayload({ config: configPromise })

  // Fetch Header Global
  const header = (await payload.findGlobal({
    slug: 'header',
    depth: 1, // Depth 1 to get the logo media object
    locale,
  })) as Header

  // console.log('Nav Header Data:', JSON.stringify(header, null, 2))

  // Use header navItems from CMS - order is controlled by drag & drop in admin
  const navItems = (header?.navItems || []).map((item) => {
    // globalPage is a string literal (union type) based on payload-types.ts
    const slug = item.globalPage
    return {
      label: item.label,
      link: slug ? `/${slug}` : '#',
      globalPage: slug || '',
    }
  })

  // Fetch login links
  const loginLinks = header?.loginLinks || []

  // Extract logo
  const logo = header?.logo && typeof header.logo === 'object' ? header.logo : null

  return <NavClient navItems={navItems} loginLinks={loginLinks} logo={logo} locale={locale} />
}
