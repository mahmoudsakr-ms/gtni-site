import React from 'react'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import '../globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { routing, type AppLocale } from '@/i18n/routing'
import { getPublicBaseUrl, NOINDEX, BASE_PATH } from '@/utilities/publicUrl'

export const metadata = {
  metadataBase: new URL(getPublicBaseUrl()),
  description: 'Gouna Technical Nursing Institute Official Website',
  // Explicit BASE_PATH rather than relying on metadataBase's relative-URL
  // resolution for this field specifically -- kept consistent with every other
  // favicon/local-asset reference in the app now being explicit, after finding
  // next/image's own default loader does NOT apply basePath to local `src`
  // paths (confirmed by reading next/dist/shared/lib/image-loader.js).
  icons: {
    icon: `${BASE_PATH}/favicon.ico`,
  },
  title: {
    default: 'GTNI | Gouna Technical Nursing Institute',
    template: '%s | GTNI',
  },
  openGraph: {
    type: 'website',
    siteName: 'Gouna Technical Nursing Institute',
  },
  twitter: {
    card: 'summary_large_image',
  },
  // No individual page currently sets its own `robots` field, so this sitewide
  // default (NEXT_PUBLIC_NOINDEX=true -- a parallel/staging deployment that
  // shouldn't be indexed) applies to every page unchanged.
  ...(NOINDEX && { robots: { index: false, follow: false } }),
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { children } = props
  const { locale } = await props.params

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound()
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  // Universal GTNI Schema
  const universitySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: 'Gouna Technical Nursing Institute (GTNI)',
    url: getPublicBaseUrl(),
    logo: `${getPublicBaseUrl()}/favicon.ico`,
    description:
      'A premiere nursing education institute in El Gouna, Egypt, dedicated to producing world-class healthcare professionals.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'El Gouna',
      addressRegion: 'Red Sea Governorate',
      addressCountry: 'EG',
    },
    telephone: '+20 1271976237',
  }

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* No messages catalog: all real content comes from Payload CMS, not next-intl
            message files. The provider is only here so client components (the language
            switcher) can use next-intl's locale-aware navigation hooks. */}
        <NextIntlClientProvider locale={locale}>
          <JsonLd data={universitySchema} />
          <Nav locale={locale as AppLocale} />
          <main>{children}</main>
          <Footer locale={locale as AppLocale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
