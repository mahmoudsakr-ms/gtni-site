import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mounts the whole app under this path prefix (e.g. '/new') when set -- empty
  // by default so existing deployments/dev are unaffected. @payloadcms/next's
  // withPayload() reads this and propagates it to process.env.NEXT_BASE_PATH,
  // which Payload's own URL-building (admin routes, its REST API, and upload
  // file URLs -- see formatAdminURL/generateFilePathOrURL in payload's source)
  // already uses internally. See src/utilities/publicUrl.ts for the handful of
  // places in THIS project's own code (sitemap, robots, metadata, the password-
  // reset email link) that also need to know about it explicitly.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

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

  // Don't advertise the framework in responses (was leaking "X-Powered-By: Next.js, Payload").
  poweredByHeader: false,

  // Baseline security headers, site-wide. Deliberately NOT including a Content-Security-Policy
  // here yet — Payload's admin panel is sensitive to CSP misconfiguration (risk of locking out
  // admin access) and needs dedicated testing before one is added; tracked as follow-up work.
  //
  // Keep this list identical to the SECURITY_HEADERS object in src/middleware.ts -- that file
  // sets these same headers directly on every response next-intl's middleware produces, as a
  // belt-and-suspenders fix for a basePath-root case where this config's own rule below wasn't
  // enough in at least one real production-like test.
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    return [
      // Explicit '/' rule alongside the catch-all below -- under `basePath`, a request for
      // exactly the basePath root doesn't reliably pick up the '/:path*' rule (the same class
      // of basePath-root edge case already fixed for the middleware matcher in
      // src/middleware.ts); without this, the homepage was the one page silently served with
      // no security headers at all under a basePath. A no-op duplicate when basePath is unset.
      { source: '/', headers: securityHeaders },
      { source: '/:path*', headers: securityHeaders },
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
