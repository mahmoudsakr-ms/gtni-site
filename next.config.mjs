import { withPayload } from '@payloadcms/next/withPayload'

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
      { source: '/about', destination: '/about-gtni', permanent: true },
      { source: '/ar/about', destination: '/about-gtni', permanent: true },
      { source: '/accommodation', destination: '/student-services', permanent: true },
      { source: '/ar/accommodation', destination: '/student-services', permanent: true },
      //{ source: '/admission', destination: '/admission', permanent: true },
      { source: '/ar/admission', destination: '/admission', permanent: true },
      { source: '/alumni', destination: '/about-gtni', permanent: true },
      { source: '/ar/alumni', destination: '/about-gtni', permanent: true },
      { source: '/contact-us', destination: '/about-gtni', permanent: true },
      { source: '/ar/contact-us', destination: '/about-gtni', permanent: true },
      //{ source: '/courses', destination: '/courses', permanent: true },
      { source: '/ar/courses', destination: '/courses', permanent: true },
      { source: '/facilities', destination: '/student-services', permanent: true },
      { source: '/ar/facilities', destination: '/student-services', permanent: true },
      { source: '/faq', destination: '/admission', permanent: true },
      { source: '/ar/faq', destination: '/admission', permanent: true },
      { source: '/gouna-life', destination: '/student-services', permanent: true },
      { source: '/ar/gouna-life', destination: '/student-services', permanent: true },
      { source: '/news', destination: '/news-events', permanent: true },
      { source: '/ar/news', destination: '/news-events', permanent: true },
      { source: '/news-details/:path*', destination: '/news-events', permanent: true },
      { source: '/nursing-program', destination: '/nursing-programs', permanent: true },
      { source: '/ar/nursing-program', destination: '/nursing-programs', permanent: true },
      { source: '/student-life', destination: '/student-services', permanent: true },
      { source: '/ar/student-life', destination: '/student-services', permanent: true },
      //{ source: '/vacancies', destination: '/vacancies', permanent: true },
      { source: '/ar/vacancies', destination: '/vacancies', permanent: true },
      { source: '/ar', destination: '/', permanent: true },
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

export default withPayload(nextConfig, { devBundleServerPackages: false })
