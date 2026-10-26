import { getPayload } from 'payload'
import React from 'react'
import configPromise from '@payload-config'
import type { Home } from '@/payload-types'
import { HeroClient } from '@/components/Hero'
import { WelcomeSection } from '@/components/WelcomeSection'
import { AnnouncementSection } from '@/components/AnnouncementSection'
import { FeatureCardsSection } from '@/components/FeatureCardsSection'
import { FeaturedNewsEvents } from '@/components/FeaturedNewsEvents'
import { StudentTestimonials } from '@/components/StudentTestimonials'
import { Metadata } from 'next'
import { buildLocaleAlternates } from '@/utilities/localeMetadata'
import { BASE_PATH } from '@/utilities/publicUrl'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const homeData: Home = await payload.findGlobal({
    slug: 'home',
    depth: 1,
    locale: locale as 'en' | 'ar',
  })

  // Determine OG Image
  let ogImage = `${BASE_PATH}/favicon.ico`
  const hero = homeData?.hero
  if (
    hero?.type === 'slider' &&
    hero?.slider?.[0]?.image &&
    typeof hero.slider[0].image === 'object' &&
    'url' in hero.slider[0].image
  ) {
    ogImage = hero.slider[0].image.url || ogImage
  }

  return {
    title: homeData?.hero?.title || 'GTNI',
    description: homeData?.hero?.subtitle || 'Gouna Technical Nursing Institute',
    alternates: buildLocaleAlternates(locale, '/'),
    openGraph: {
      title: homeData?.hero?.title || 'GTNI',
      description: homeData?.hero?.subtitle || 'Gouna Technical Nursing Institute',
      url: '/',
      siteName: 'Gouna Technical Nursing Institute',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: homeData?.hero?.title || 'GTNI',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: homeData?.hero?.title || 'GTNI',
      description: homeData?.hero?.subtitle || 'Gouna Technical Nursing Institute',
      images: [ogImage],
    },
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch Homepage data from Home Global
  const homeData: Home = await payload.findGlobal({
    slug: 'home',
    depth: 2,
    locale: locale as 'en' | 'ar',
  })

  const heroData = homeData?.hero
  const announcementData = homeData?.announcement
  const welcomeData = homeData?.welcome
  const featureCardsData = homeData?.featureCards

  // Prepare data for Hero component
  const sliderImages =
    heroData?.slider
      ?.map((s) => {
        const img = s.image
        let url = ''
        if (img && typeof img === 'object' && 'url' in img) {
          url = img.url || ''
        }
        return { image: url }
      })
      .filter((s) => s.image) || []

  // Safe check for video object before accessing .url
  const videoUrl =
    heroData?.video && typeof heroData.video === 'object' && 'url' in heroData.video
      ? (heroData.video.url as string)
      : ''

  // Prepare feature cards from Home Global configuration
  const featureCards = (featureCardsData?.cards || []).map((card, index) => {
    const slug = card.globalPage || '#'

    // Map global slugs to titles if cardTitle is empty
    const titleMap: Record<string, string> = {
      'about-gtni': 'About GTNI',
      'student-services': 'Student Services',
      'nursing-programs': 'The Program',
      scholarships: 'Scholarships',
      admission: 'Admission',
      vacancies: 'Vacancies',
      'news-events': 'News & Events',
      courses: 'Courses',
    }

    const defaultTitle = titleMap[slug] || 'Untitled'

    let cardImageUrl: string | null = null
    if (
      card.cardImage &&
      typeof card.cardImage === 'object' &&
      'url' in card.cardImage &&
      card.cardImage.url
    ) {
      cardImageUrl = card.cardImage.url
    }

    return {
      id: `global-${slug}-${index}`,
      title: defaultTitle,
      slug: slug,
      cardImage: cardImageUrl,
      cardTitle: card.cardTitle || null,
      order: index + 1,
    }
  })

  return (
    <main className="min-h-screen">
      <HeroClient
        type={heroData?.type || 'video'}
        videoUrl={videoUrl || undefined}
        externalVideoUrl={heroData?.externalVideoUrl || undefined}
        videoSource={heroData?.videoSource || undefined}
        slides={sliderImages}
        title={heroData?.title || ''}
        subtitle={heroData?.subtitle || ''}
      />

      <AnnouncementSection
        line1={announcementData?.line1 || undefined}
        line2={announcementData?.line2 || undefined}
      />

      {welcomeData && (
        <WelcomeSection
          title={welcomeData.title || ''}
          content={welcomeData.content}
          signature={welcomeData.signature || undefined}
          signatureImage={welcomeData.signatureImage}
        />
      )}

      {/* Feature Cards Section - 6 cards in 3x2 grid */}
      {featureCardsData?.enabled && featureCards.length > 0 && (
        <FeatureCardsSection cards={featureCards} />
      )}

      {/* Featured News & Events - World Class Section */}
      <FeaturedNewsEvents />
      <StudentTestimonials />
    </main>
  )
}
