import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import RichText from '@/components/RichText'
import AccommodationFacilities from './AccommodationFacilities'
import type { AccommodationBlock } from './types'

interface AccommodationProps {
  accommodationContent: AccommodationBlock['accommodationContent']
  accommodationImage: AccommodationBlock['accommodationImage']
  accommodationFacilitiesImage: AccommodationBlock['accommodationFacilitiesImage']
  accommodationFacilitiesTitle?: string | null
  accommodationTitle: string
  bgColor?: string
  isDark?: boolean
}

const Accommodation: React.FC<AccommodationProps> = ({
  accommodationContent,
  accommodationImage,
  accommodationFacilitiesImage,
  accommodationFacilitiesTitle,
  accommodationTitle,
  bgColor = 'bg-white',
  isDark = false,
}) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  }

  const accommodationImageUrl =
    accommodationImage &&
    typeof accommodationImage === 'object' &&
    'url' in accommodationImage
      ? accommodationImage.url
      : null

  return (
    <section className={`py-24 relative overflow-hidden ${bgColor}`}>
      {isDark ? (
        <>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-turquoise/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-turquoise/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="container mx-auto lg:px-4 px-2 max-w-7xl relative z-10">
        {/* 1. Accommodation Overview Section */}
        {accommodationContent && (
          accommodationImageUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
              <motion.div {...fadeIn} className="order-2 lg:order-1">
                <h2 className={`lg:text-3xl md:text-2xl text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-brand-dark'}`}>
                  {accommodationTitle}
                </h2>
                <div className={`prose prose-lg leading-relaxed ${
                  isDark 
                    ? 'prose-p:text-white/90 prose-headings:text-white text-white/90' 
                    : 'prose-p:text-brand-dark/85 prose-headings:text-brand-dark text-brand-dark/85'
                }`}>
                  <RichText content={accommodationContent} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2 relative aspect-4/3 rounded-3xl overflow-hidden shadow-3xl group"
              >
                <Image
                  src={accommodationImageUrl}
                  alt={accommodationTitle}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-dark/40 to-transparent" />
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mb-32 text-start">
              <motion.div {...fadeIn} className="w-full">
                <h2 className={`lg:text-3xl md:text-2xl text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-brand-dark'}`}>
                  {accommodationTitle}
                </h2>
                <div className={`prose prose-lg leading-relaxed ${
                  isDark 
                    ? 'prose-p:text-white/90 prose-headings:text-white text-white/90' 
                    : 'prose-p:text-brand-dark/85 prose-headings:text-brand-dark text-brand-dark/85'
                }`}>
                  <RichText content={accommodationContent} />
                </div>
              </motion.div>
            </div>
          )
        )}

        {/* Divider Line */}
        <div className={`w-full h-px mb-32 ${isDark ? 'bg-white/20' : 'bg-brand-turquoise/60'}`} />
      </div>
      {/* 2. Accommodation Facilities Section */}
      <AccommodationFacilities
        accommodationFacilitiesTitle={accommodationFacilitiesTitle}
        accommodationFacilitiesImage={accommodationFacilitiesImage}
      />
    </section>
  )
}

export default Accommodation
