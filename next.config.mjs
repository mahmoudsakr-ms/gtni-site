import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
 
 serverExternalPackages: [
    'libsql',
    '@libsql/client',
  ],


  // ════════════════════════════════════════════════════════════
  // SEO MIGRATION 301 PERMANENT REDIRECTS
  // ════════════════════════════════════════════════════════════
  async redirects() {
    return [
      // Main English & Arabic Pages from Old GTNI Site
      //
      // NOTE: `/ar/admission`, `/ar/courses`, `/ar/vacancies`, and bare `/ar` are
      // deliberately NOT redirected here (they used to collapse into the English
      // URL) -- those are now real routes serving the actual Arabic pages
      // (Phase 4, next-intl locale routing). A redirect here would permanently
      // shadow the real page at the same path. Every other `/ar/*` legacy path
      // below points at the Arabic-prefixed version of its new slug instead of
      // the English one, so old Arabic links land on the Arabic page.
      { source: '/about', destination: '/about-gtni', permanent: true },
      { source: '/ar/about', destination: '/ar/about-gtni', permanent: true },
      { source: '/accommodation', destination: '/student-services', permanent: true },
      { source: '/ar/accommodation', destination: '/ar/student-services', permanent: true },
      //{ source: '/admission', destination: '/admission', permanent: true },
      { source: '/alumni', destination: '/about-gtni', permanent: true },
      { source: '/ar/alumni', destination: '/ar/about-gtni', permanent: true },
      { source: '/contact-us', destination: '/about-gtni', permanent: true },
      { source: '/ar/contact-us', destination: '/ar/about-gtni', permanent: true },
      //{ source: '/courses', destination: '/courses', permanent: true },
      { source: '/facilities', destination: '/student-services', permanent: true },
      { source: '/ar/facilities', destination: '/ar/student-services', permanent: true },
      { source: '/faq', destination: '/admission', permanent: true },
      { source: '/ar/faq', destination: '/ar/admission', permanent: true },
      { source: '/gouna-life', destination: '/student-services', permanent: true },
      { source: '/ar/gouna-life', destination: '/ar/student-services', permanent: true },
      { source: '/news', destination: '/news-events', permanent: true },
      { source: '/ar/news', destination: '/ar/news-events', permanent: true },
      { source: '/news-details/:path*', destination: '/news-events', permanent: true },
      { source: '/nursing-program', destination: '/nursing-programs', permanent: true },
      { source: '/ar/nursing-program', destination: '/ar/nursing-programs', permanent: true },
      { source: '/student-life', destination: '/student-services', permanent: true },
      { source: '/ar/student-life', destination: '/ar/student-services', permanent: true },
      //{ source: '/vacancies', destination: '/vacancies', permanent: true },
    ]
  },

  // Baseline security headers, site-wide. Deliberately NOT including a Content-Security-Policy
  // here yet — Payload's admin panel is sensitive to CSP misconfiguration (risk of locking out
  // admin access) and needs dedicated testing before one is added; tracked as follow-up work.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Increase body size limit for file uploads (default is 4MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
