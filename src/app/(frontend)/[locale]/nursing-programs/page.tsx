import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { NursingProgram, Media } from '@/payload-types'
import RunawayTriangles from '@/components/PhysicsTriangle'
import { NursingProgramsSection } from '@/components/NursingProgramsSection'
import Image from 'next/image'

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const data = (await payload.findGlobal({
    slug: 'nursing-programs',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })) as NursingProgram

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : `${BASE_PATH}/favicon.ico`

  return {
    title: data?.heroTitle || '',
    description: data?.heroSubtitle || '',
    alternates: buildLocaleAlternates(locale, '/nursing-programs'),
    openGraph: {
      title: data?.heroTitle || 'The Program',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      url: '/nursing-programs',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || `${BASE_PATH}/favicon.ico`,
          width: 1200,
          height: 630,
          alt: data?.heroTitle || 'The Program',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || 'The Program',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      images: [heroImageUrl || `${BASE_PATH}/favicon.ico`],
    },
  }
}

export default async function NursingProgramsPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch nursing programs global data
  const data = (await payload.findGlobal({
    slug: 'nursing-programs',
    depth: 2,
    locale: locale as 'en' | 'ar',
  })) as NursingProgram
  // Get hero image URL
  const heroImageUrl = (data?.heroImage as Media)?.url
  const heroTitle = data?.heroTitle || ''
  const heroSubtitle = data?.heroSubtitle || ''

  return (
    <main className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* PREMIUM HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={heroTitle}
              fill
              sizes="100vw"
              quality={100}
              priority
              className="w-full h-full object-cover scale-110"
              style={{ transform: 'translateZ(0)' }}
            />
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
            {/* <div className="absolute inset-0 bg-linear-to-r from-brand-dark/80 to-transparent" /> */}
            {/* <div className="absolute inset-0 bg-brand-dark/20" /> */}
          </div>
        ) : (
          /* Premium Animated Background when no image */
          <div className="absolute inset-0 bg-brand-dark">
            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-turquoise/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-64 h-64 bg-linear-to-br from-brand-turquoise/30 to-brand-primary/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '2s' }}
            />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <svg
            className="absolute -right-20 -top-20 w-96 h-96 text-brand-turquoise/10"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Floating Shapes - Interactive Runaway Triangles */}
        <RunawayTriangles />
        <div
          className="absolute top-40 right-20 w-16 h-16 border border-brand-turquoise/20 rounded-full animate-bounce"
          style={{ animationDuration: '4s' }}
        />

        {/* Hero Content */}
        <div className="container mx-auto max-w-7xl px-4 relative z-10 py-32">
          <div className="mx-auto max-w-4xl items-center flex flex-col text-center">
            {/* Breadcrumb / Category Tag */}
            <div className="inline-flex items-center gap-2 mb-6">
              {/* <span className="w-12 h-px bg-brand-turquoise" /> */}
              {/* <span className="text-brand-turquoise text-sm font-semibold tracking-[0.3em] uppercase">
                   {pageType?.replace('-', ' ') || 'GTNI'}
                 </span> */}
            </div>

            {/* Title with Gradient Effect */}
            {heroTitle && (
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-6">
                <span className="inline-block">{heroTitle}</span>
              </h1>
            )}

            {/* Subtitle */}
            {heroSubtitle && (
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed font-light">
                {heroSubtitle}
              </p>
            )}

            {/* Decorative Line */}
            {heroTitle && (
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-linear-to-r from-brand-turquoise to-brand-primary rounded-full" />
                <div className="w-3 h-3 bg-brand-turquoise rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nursing Programs Section */}
      <NursingProgramsSection
        overview={data?.overview || undefined}
        epslos={
          data?.epslos
            ? {
                sectionTitle: data.epslos.sectionTitle || undefined,
                sectionSubtitle: data.epslos.sectionSubtitle || undefined,
                categories:
                  data.epslos.categories?.map((cat) => ({
                    ...cat,
                    items: cat.items || undefined,
                    id: cat.id || undefined,
                    image: cat.image || undefined,
                  })) || undefined,
              }
            : undefined
        }
        coursesSection={
          data?.coursesSection
            ? {
                sectionTitle: data.coursesSection.sectionTitle || undefined,
                description: data.coursesSection.description || undefined,
                image: data.coursesSection.image || undefined,
                buttonText: data.coursesSection.buttonText || undefined,
                buttonLink: data.coursesSection.buttonLink || undefined,
              }
            : undefined
        }
      />
    </main>
  )
}
