import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Course, Media } from '@/payload-types'
import { CoursesContent } from '@/components/CoursesContent'
import RunawayTriangles from '@/components/PhysicsTriangle'
import Image from 'next/image'

import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const coursesData = await payload.findGlobal({
    slug: 'courses',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })
  const data = coursesData as unknown as Course

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : '/favicon.ico'

  return {
    title: data?.heroTitle || 'Our Courses',
    description:
      data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
    alternates: buildLocaleAlternates(locale, '/courses'),
    openGraph: {
      title: data?.heroTitle || 'Our Courses',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      url: '/courses',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || '/favicon.ico',
          width: 1200,
          height: 630,
          alt: data?.heroTitle || 'Our Courses',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || 'Our Courses',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      images: [heroImageUrl || '/favicon.ico'],
    },
  }
}

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch courses global data
  const coursesData = await payload.findGlobal({
    slug: 'courses',
    depth: 2,
    locale: locale as 'en' | 'ar',
  })

  const data = coursesData as unknown as Course
  const heroImageUrl = (data?.heroImage as Media)?.url
  const heroTitle = data?.heroTitle || 'Our Courses'
  const heroSubtitle =
    data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence'

  return (
    <main className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* PREMIUM HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={heroTitle}
              fill
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

        {/* Bottom Wave */}
        {/* <div className="absolute bottom-0 left-0 right-0">
             <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
               <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,69.3C960,85,1056,107,1152,101.3C1248,96,1344,64,1392,48L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
             </svg>
           </div> */}
      </section>

      {/* Courses Content */}
      <CoursesContent
        overviewTitle={data?.overviewTitle || undefined}
        overviewContent={data?.overviewContent || undefined}
        creditHoursTitle={data?.creditHoursTitle || undefined}
        creditHoursDescription={data?.creditHoursDescription || undefined}
        creditHoursRules={data?.creditHoursRules || undefined}
        semesters={
          data?.semesters?.map((s) => ({
            ...s,
            id: s.id || undefined,
            weeks: s.weeks || undefined,
            tabLabel: s.tabLabel || undefined,
            description: s.description || undefined,
            courses:
              s.courses?.map((c) => ({
                ...c,
                id: c.id || undefined,
                classHours: c.classHours || undefined,
                clinicalHours: c.clinicalHours || undefined,
                totalCourseHours: c.totalCourseHours || undefined,
                totalCredit: c.totalCredit || undefined,
                prerequisites: c.prerequisites || undefined,
                corequisites: c.corequisites || undefined,
              })) || undefined,
          })) || undefined
        }
        competencyTitle={data?.competencyTitle || undefined}
        competencyDescription={data?.competencyDescription || undefined}
        clinicalHoursMin={data?.clinicalHoursMin || undefined}
        clinicalHoursMax={data?.clinicalHoursMax || undefined}
        clinicalHoursText={data?.clinicalHoursText || undefined}
      />
    </main>
  )
}
