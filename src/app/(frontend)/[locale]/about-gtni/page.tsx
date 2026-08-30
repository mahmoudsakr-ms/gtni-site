import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { AboutGtni, Media } from '@/payload-types'
import RunawayTriangles from '@/components/PhysicsTriangle'
import { AboutPhilosophy } from '@/components/AboutPhilosophy'
import { AboutLeadership } from '@/components/AboutLeadership'
import { AboutPageContent } from '@/components/AboutPageContent'
import { AboutFacultyMembers } from '@/components/AboutFacultyMembers'
import { AboutOtherMembers } from '@/components/AboutOtherMembers'
import { AboutAdminMembers } from '@/components/AboutAdminMembers'
import { AlumniMap } from '@/components/AlumniMap'
import { GtniInNumbers } from '@/components/GtniInNumbers'
import { AboutHeroMedia } from '@/components/AboutHeroMedia'
import { Metadata } from 'next'
import { SmartText } from '@/components/SmartText'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const data: AboutGtni = await payload.findGlobal({
    slug: 'about-gtni',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })

  const heroImageUrl =
    data?.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage.url
      : '/favicon.ico'

  return {
    title: data?.heroTitle || '',
    description: data?.heroSubtitle || '',
    alternates: buildLocaleAlternates(locale, '/about-gtni'),
    openGraph: {
      title: data?.heroTitle || 'About GTNI',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      url: '/about-gtni',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: heroImageUrl || '/favicon.ico',
          width: 1200,
          height: 630,
          alt: data?.heroTitle || 'About GTNI',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.heroTitle || 'About GTNI',
      description:
        data?.heroSubtitle || 'Competency-based curriculum designed for nursing excellence',
      images: [heroImageUrl || '/favicon.ico'],
    },
  }
}

export default async function AboutGtniPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch about gtni global data
  const data = (await payload.findGlobal({
    slug: 'about-gtni',
    depth: 2,
    locale: locale as 'en' | 'ar',
  })) as AboutGtni

  // Get hero media configurations
  const hasHeroMedia =
    (data?.type === 'video' &&
      ((data?.videoSource === 'local' && data?.video) ||
        (data?.videoSource === 'external' && data?.externalVideoUrl))) ||
    ((!data?.type || data?.type === 'image') && data?.heroImage)

  const heroImageUrl = (data?.heroImage as Media)?.url || null
  const videoUrl = (data?.video as Media)?.url || null
  const externalVideoUrl = data?.externalVideoUrl || null
  const videoSource = data?.videoSource || null
  const heroType = data?.type || 'image'

  const heroTitle = data?.heroTitle || ''
  const heroSubtitle = data?.heroSubtitle || ''

  return (
    <main className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* PREMIUM HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Media with Parallax Effect */}
        {hasHeroMedia ? (
          <AboutHeroMedia
            type={heroType}
            heroImageUrl={heroImageUrl}
            heroTitle={heroTitle}
            videoUrl={videoUrl}
            externalVideoUrl={externalVideoUrl}
            videoSource={videoSource}
          />
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
                <span className="inline-block"><SmartText text={heroTitle} /></span>
              </h1>
            )}

            {/* Subtitle */}
            {heroSubtitle && (
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed font-light">
                <SmartText text={heroSubtitle} />
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
      <AboutPageContent mission={data.mission} vision={data.vision} />

      {/* Philosophy Section */}
      {data.philosophyContent && (
        <AboutPhilosophy
          title={data.philosophyTitle || undefined}
          content={data.philosophyContent}
          image={
            (data.philosophyImage as Media)?.url
              ? {
                  ...(data.philosophyImage as Media),
                  url: (data.philosophyImage as Media).url!,
                  alt: (data.philosophyImage as Media).alt || undefined,
                }
              : undefined
          }
        />
      )}

      {/* Alumni World Map */}
      <AlumniMap />

      {/* GTNI In Numbers Section */}
      {data.stats && data.stats.length > 0 && (
        <GtniInNumbers
          sectionTitle={data.sectionTitle || undefined}
          stats={data.stats.map((stat) => ({
            ...stat,
            description: stat.description || undefined,
            id: stat.id || undefined,
          }))}
        />
      )}

      {/* Board Members Section */}
      {data.leadershipMembers && data.leadershipMembers.length > 0 && (
        <AboutLeadership
          title={data.leadershipTitle || ''}
          items={data.leadershipMembers.map((member) => ({
            ...member,
            role: member.role || undefined,
            photo: (member.photo as Media)?.url
              ? {
                  ...(member.photo as Media),
                  url: (member.photo as Media).url!,
                  alt: (member.photo as Media).alt || undefined,
                }
              : undefined,
            id: member.id || undefined,
            bio: member.bio || undefined,
          }))}
        />
      )}

      {/* Other Members Section */}
      {data.otherMembers && data.otherMembers.length > 0 && (
        <AboutOtherMembers
          title={data.otherTitle || ''}
          items={data.otherMembers.map((member) => ({
            ...member,
            role: member.role || undefined,
            photo: (member.photo as Media)?.url
              ? {
                  ...(member.photo as Media),
                  url: (member.photo as Media).url!,
                  alt: (member.photo as Media).alt || undefined,
                }
              : undefined,
            id: member.id || undefined,
            bio: member.bio || undefined,
          }))}
        />
      )}

      {/* Faculty Members Section */}
      {data.facultyMembers && data.facultyMembers.length > 0 && (
        <AboutFacultyMembers
          title={data.facultyTitle || ''}
          items={data.facultyMembers.map((member) => ({
            ...member,
            role: member.role || undefined,
            photo: (member.photo as Media)?.url
              ? {
                  ...(member.photo as Media),
                  url: (member.photo as Media).url!,
                  alt: (member.photo as Media).alt || undefined,
                }
              : undefined,
            id: member.id || undefined,
            bio: member.bio || undefined,
          }))}
        />
      )}

      {/* Admin Members Section */}
      {data.adminMembers && data.adminMembers.length > 0 && (
        <AboutAdminMembers
          title={data.adminTitle || ''}
          items={data.adminMembers.map((member) => ({
            ...member,
            role: member.role || undefined,
            photo: (member.photo as Media)?.url
              ? {
                  ...(member.photo as Media),
                  url: (member.photo as Media).url!,
                  alt: (member.photo as Media).alt || undefined,
                }
              : undefined,
            id: member.id || undefined,
            bio: member.bio || undefined,
          }))}
        />
      )}

    </main>
  )
}
