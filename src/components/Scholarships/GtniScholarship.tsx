'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import RichText from '@/components/RichText'
import type { ScholarshipSectionBlock } from './types'

interface GtniScholarshipProps {
  title?: string | null
  content?: ScholarshipSectionBlock['content']
  image?: ScholarshipSectionBlock['image']
  bgColor?: string
  isDark?: boolean
  index?: number
}

const GtniScholarship: React.FC<GtniScholarshipProps> = ({
  title,
  content,
  image,
  bgColor = 'bg-brand-dark',
  isDark = true,
  index = 0,
}) => {
  if (!content && !image) return null

  const imageUrl = image && typeof image === 'object' && 'url' in image ? image.url : null

  // Alternating layout: even items image on the right, odd items image on the left
  const isImageRight = index % 2 === 0

  return (
    <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${bgColor}`}>
      {/* Premium Decorative Background Elements */}
      {isDark ? (
        <>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-turquoise/5 skew-x-12 transform origin-top-right pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-1/4 h-full bg-brand-primary/2 skew-x-12 transform origin-top-left pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-brand-turquoise/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        {imageUrl ? (
          <div className={`flex flex-col lg:flex-row items-center gap-16 ${isImageRight ? '' : 'lg:flex-row-reverse'}`}>
            {/* Content Column */}
            <motion.div
              initial={{ opacity: 0, x: isImageRight ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              {title && (
                <h2 className={`lg:text-3xl md:text-2xl text-xl font-bold mb-8 leading-tight ${isDark ? 'text-white' : 'text-brand-dark'}`}>
                  {title}
                </h2>
              )}

              <div className={`prose prose-lg max-w-none ${
                isDark 
                  ? 'prose-p:text-white/90 prose-headings:text-white text-white/90' 
                  : 'prose-p:text-brand-dark/85 prose-headings:text-brand-dark text-brand-dark/85'
              }`}>
                {content && <RichText content={content} />}
              </div>
            </motion.div>

            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: isImageRight ? 50 : -50, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-dark/10">
                <div className="relative aspect-4/3 lg:aspect-square">
                  <Image
                    src={imageUrl}
                    alt={title || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-brand-dark/20 to-transparent" />
                </div>

                {/* Decorative Frame */}
                <div className={`absolute inset-0 border-[6px] rounded-[2.5rem] pointer-events-none ${isDark ? 'border-white/20' : 'border-brand-dark/10'}`} />
              </div>

              {/* Floating Blur Accent */}
              <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl -z-10 ${isDark ? 'bg-brand-turquoise/10' : 'bg-brand-primary/10'}`} />
            </motion.div>
          </div>
        ) : (
          <div className="max-w-4xl text-start">
            {/* Content Column Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full"
            >
              {title && (
                <h2 className={`lg:text-3xl md:text-2xl text-xl font-bold mb-8 leading-tight ${isDark ? 'text-white' : 'text-brand-dark'}`}>
                  {title}
                </h2>
              )}

              <div className={`prose prose-lg max-w-none ${
                isDark 
                  ? 'prose-p:text-white/90 prose-headings:text-white text-white/90' 
                  : 'prose-p:text-brand-dark/85 prose-headings:text-brand-dark text-brand-dark/85'
              }`}>
                {content && <RichText content={content} />}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

export default GtniScholarship
