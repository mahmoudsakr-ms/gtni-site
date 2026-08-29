'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { ChevronRight, CheckCircle, ArrowRight } from 'lucide-react'
import RichText from '@/components/RichText'
import Image from 'next/image'
import Link from 'next/link'
import { SmartText } from './SmartText'
import type { Media } from '@/payload-types'

interface EPSLOCategory {
  id?: string
  title: string
  items?: string // Textarea content (line-separated)
  image?: number | Media | null
}

import type { Course } from '@/payload-types'

interface CoursesSection {
  sectionTitle?: string
  description?: Course['overviewContent']
  image?: number | Media | null
  buttonText?: string
  buttonLink?: string
}

interface NursingProgramsSectionProps {
  overview?: Course['overviewContent']
  epslos?: {
    sectionTitle?: string
    sectionSubtitle?: string
    categories?: EPSLOCategory[]
  }
  coursesSection?: CoursesSection
}

// ============================================
// ANIMATIONS
// ============================================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] as const },
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function parseOutcomes(text?: string): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function getImageUrl(image?: number | Media | null): string | null {
  if (!image) return null
  if (typeof image === 'number') return null
  return image.url || null
}

// ============================================
// MAIN COMPONENT
// ============================================
export function NursingProgramsSection({
  overview,
  epslos,
  coursesSection,
}: NursingProgramsSectionProps) {
  return (
    <>
      {/* ============================================ */}
      {/* SECTION 1: OVERVIEW - White Background */}
      {/* ============================================ */}
      {overview && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-brand-turquoise/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl relative z-10"
          >
            <motion.div variants={itemVariants} className="text-start mb-8">
              <h2 className="lg:text-3xl md:text-2xl font-bold text-brand-dark">
                <SmartText text="Program Overview" />
              </h2>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="prose prose-xl prose-p:text-gray-600 prose-p:leading-relaxed prose-headings:text-brand-dark max-w-none"
            >
              {overview && <RichText content={overview} />}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 2: EPSLOs - Learning Outcomes */}
      {/* ============================================ */}
      {epslos?.categories && epslos.categories.length > 0 && (
        <section className="py-24 bg-zinc-50 relative overflow-hidden">
          {/* Decorative triangles */}
          <div className="absolute top-20 right-10 opacity-20">
            <svg width="120" height="120" viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill="none" stroke="#53b5b2" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute bottom-20 right-32 opacity-15">
            <svg width="80" height="80" viewBox="0 0 100 100">
              <polygon points="50,90 90,10 10,10" fill="none" stroke="#53b5b2" strokeWidth="2" />
            </svg>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl relative z-10"
          >
            {/* Section Header */}
            <motion.div variants={itemVariants} className="text-start mb-16">
              <h2 className="lg:text-3xl md:text-2xl font-bold text-brand-dark mb-4">
                {epslos.sectionTitle || 'EPSLOs'}
              </h2>
              <p className="text-xl text-gray-500">
                {epslos.sectionSubtitle || 'End-of-Program Student Learning Outcomes'}
              </p>
            </motion.div>

            {/* Categories */}
            <div className="space-y-8">
              {epslos.categories.map((category, index) => (
                <motion.div
                  key={category.id || index}
                  variants={itemVariants}
                  className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="bg-brand-dark text-white px-8 py-5 flex items-center gap-4">
                    <h3 className="text-xl font-bold uppercase tracking-wide">{category.title}</h3>
                    <div className="w-10 h-10 bg-brand-turquoise rounded-xl flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Outcomes List and optional Image */}
                  {(() => {
                    const imageUrl = getImageUrl(category.image)
                    if (imageUrl) {
                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 items-start">
                          <div
                            className={`lg:col-span-7 lg:pt-3 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                          >
                            <ul className="space-y-4">
                              {parseOutcomes(category.items).map((outcome, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle
                                    size={20}
                                    className="text-brand-turquoise mt-0.5 shrink-0"
                                  />
                                  <span className="text-gray-700 leading-relaxed">{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div
                            className={`lg:col-span-5 relative aspect-video lg:aspect-3/2 rounded-2xl overflow-hidden shadow-md border border-gray-100 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                          >
                            <Image
                              src={imageUrl}
                              alt={category.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 35vw"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div className="p-8">
                        <ul className="space-y-4">
                          {parseOutcomes(category.items).map((outcome, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle
                                size={20}
                                className="text-brand-turquoise mt-0.5 shrink-0"
                              />
                              <span className="text-gray-700 leading-relaxed">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 3: COURSES SECTION (from CMS) */}
      {/* ============================================ */}
      {coursesSection && (coursesSection.description || coursesSection.image) && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Text Content */}
              <motion.div variants={itemVariants}>
                <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-8">
                  {coursesSection.sectionTitle || 'Courses'}
                </h2>

                {coursesSection.description && (
                  <div className="prose prose-lg prose-p:text-gray-600 prose-p:leading-relaxed max-w-none mb-8">
                    <RichText content={coursesSection.description} />
                  </div>
                )}

                {coursesSection.buttonText && coursesSection.buttonLink && (
                  <Link
                    href={coursesSection.buttonLink}
                    className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full font-bold hover:bg-brand-turquoise transition-colors duration-300"
                  >
                    {coursesSection.buttonText}
                    <ChevronRight size={20} />
                  </Link>
                )}
              </motion.div>

              {/* Image */}
              {getImageUrl(coursesSection.image) && (
                <motion.div
                  variants={itemVariants}
                  className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src={getImageUrl(coursesSection.image)!}
                    alt={coursesSection.sectionTitle || 'Courses'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {/* Decorative border */}
                  <div className="absolute inset-0 border-4 border-brand-turquoise/30 rounded-3xl" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 6: CURRICULUM CTA - Brand Gradient */}
      {/* ============================================ */}

      <section className="py-20 bg-linear-to-r from-brand-turquoise to-brand-light relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <h2 className="lg:text-3xl  text-2xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <div className="flex justify-center gap-4">
            <Link
              href="/admission"
              className="inline-flex items-center gap-3 px-6 py-4 bg-white text-brand-dark font-bold text-lg rounded-2xl hover:bg-brand-turquoise hover:text-white hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-turquoise/20"
            >
              Study With Us
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/vacancies"
              className="inline-flex items-center gap-3 px-6 py-4 bg-white text-brand-dark font-bold text-lg rounded-2xl hover:bg-brand-turquoise hover:text-white hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-turquoise/20"
            >
              Work With Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
