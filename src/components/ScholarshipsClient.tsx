'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import RunawayTriangles from './PhysicsTriangle'
import Accommodation from './Scholarships/Accommodation'
import Facilities from './Scholarships/Facilities'
import GtniScholarship from './Scholarships/GtniScholarship'

import type { Scholarship } from '@/payload-types'

interface ScholarshipsClientProps {
  data: Scholarship
}

export const ScholarshipsClient: React.FC<ScholarshipsClientProps> = ({ data }) => {
  const heroImage =
    data.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage
      ? data.heroImage
      : null
  const heroTitle = data.heroTitle
  const heroSubtitle = data.heroSubtitle

  const facilitiesSections = data.facilitiesSections || []

  return (
    <div className="bg-white selection:bg-brand-turquoise selection:text-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {heroImage?.url ? (
          <div className="absolute inset-0">
            <Image
              src={heroImage.url}
              alt={heroTitle || ''}
              fill
              sizes="100vw"
              quality={100}
              priority
              className="object-cover scale-110"
              style={{ transform: 'translateZ(0)' }}
            />
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
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
            <div className="inline-flex items-center gap-2 mb-6" />

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

      {/* Dynamic Content Blocks (Reorderable) */}
      {(data.pageBlocks || []).map((block, index) => {
        // Alternating premium backgrounds:
        // Even indices: Dark Brand bg (blue)
        // Odd indices: White bg
        const isEven = index % 2 === 0
        const style = {
          bgColor: isEven ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark',
          isDark: isEven,
        }

        const blockElement = (() => {
          if (block.blockType === 'scholarship-section') {
            return (
              <GtniScholarship
                title={block.title}
                content={block.content}
                image={block.image}
                bgColor={style.bgColor}
                isDark={style.isDark}
                index={index}
              />
            )
          }

          return null
        })()

        if (!blockElement) return null

        if (index === 0) {
          return (
            <div key={block.id} className="mt-24">
              {blockElement}
            </div>
          )
        }

        return <React.Fragment key={block.id}>{blockElement}</React.Fragment>
      })}

      {/* Accommodation & Facilities Section (Static, always renders after blocks) */}
      {(data.accommodationContent || data.accommodationImage) && (
        <Accommodation
          accommodationTitle={data.accommodationTitle || ''}
          accommodationContent={data.accommodationContent}
          accommodationImage={data.accommodationImage}
          accommodationFacilitiesTitle={data.accommodationFacilitiesTitle}
          accommodationFacilitiesImage={data.accommodationFacilitiesImage}
          bgColor={((data.pageBlocks || []).length % 2 === 0) ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark'}
          isDark={((data.pageBlocks || []).length % 2 === 0)}
        />
      )}

      {/* Facilities Sections */}
      {facilitiesSections.length > 0 && <Facilities facilitiesSections={facilitiesSections} />}

      {/* Call to Action Section (similar style as nursing-programs page) */}
      {data.buttonText && data.buttonLink && (
        <section className="py-20 bg-linear-to-r from-brand-turquoise to-brand-light relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <div className="flex justify-center">
              {(() => {
                const isExternal = data.buttonLink!.startsWith('http')
                return (
                  <Link
                    href={data.buttonLink!}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-dark font-bold text-lg rounded-2xl hover:bg-brand-turquoise hover:text-white hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-turquoise/20"
                  >
                    {data.buttonText}
                    <ArrowRight size={16} />
                  </Link>
                )
              })()}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
