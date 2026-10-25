'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { AccommodationBlock } from './types'

interface AccommodationFacilitiesProps {
  accommodationFacilitiesTitle?: string | null
  accommodationFacilitiesImage: AccommodationBlock['accommodationFacilitiesImage']
}

const AccommodationFacilities: React.FC<AccommodationFacilitiesProps> = ({
  accommodationFacilitiesTitle,
  accommodationFacilitiesImage,
}) => {
  const [activeSlide, setActiveSlide] = useState(0)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  }

  return (
    <section className=" bg-linear-to-br from-brand-dark to-brand-turquoise  py-12">
      <div className="container mx-auto max-w-7xl">
        {/* 2. Accommodation Facilities Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div {...fadeIn}>
            {accommodationFacilitiesTitle && (
              <h3 className="lg:text-3xl md:text-2xl text-xl font-bold text-white mb-6 ">
                {accommodationFacilitiesTitle}
              </h3>
            )}

          </motion.div>
        </div>

        {/* Gallery Slider for Accommodation */}
        <div className="w-full">
          {accommodationFacilitiesImage && accommodationFacilitiesImage.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="relative aspect-4/3 md:aspect-video rounded-3xl overflow-hidden shadow-2xl group/slider ring-1 ring-white/10 bg-brand-dark/20">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{
                      type: 'spring',
                      damping: 30,
                      stiffness: 250,
                      opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -50) {
                        setActiveSlide((prev) => (prev + 1) % accommodationFacilitiesImage.length)
                      } else if (info.offset.x > 50) {
                        setActiveSlide(
                          (prev) =>
                            (prev - 1 + accommodationFacilitiesImage.length) %
                            accommodationFacilitiesImage.length,
                        )
                      }
                    }}
                    className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
                  >
                    {(() => {
                      const currentItem = accommodationFacilitiesImage[activeSlide]
                      const image = currentItem?.image
                      const imageUrl =
                        image && typeof image === 'object' && 'url' in image ? image.url : null

                      return (
                        imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={`Facility ${activeSlide + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            priority
                          />
                        )
                      )
                    })()}
                    <div className="absolute inset-0 bg-linear-to-t from-brand-dark/60 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Desktop Navigation Controls (Hidden on touch devices) */}
                <div className="absolute inset-y-0 left-0 right-0 hidden lg:flex items-center justify-between px-6 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) =>
                          (prev - 1 + accommodationFacilitiesImage.length) %
                          accommodationFacilitiesImage.length,
                      )
                    }
                    className="w-14 h-14 rounded-full bg-brand-dark/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-brand-turquoise hover:border-brand-turquoise transition-all shadow-2xl"
                    aria-label="Previous slide"
                  >
                    {/* UX-12: margin made logical (me-0.5 instead of mr-0.5). Whether
                        this chevron's glyph itself should mirror (point the other way)
                        under RTL is a design call left for a human to confirm visually
                        -- not guessed at here. */}
                    <ChevronLeft className="me-0.5" size={28} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % accommodationFacilitiesImage.length)
                    }
                    className="w-14 h-14 rounded-full bg-brand-dark/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-brand-turquoise hover:border-brand-turquoise transition-all shadow-2xl"
                    aria-label="Next slide"
                  >
                    {/* UX-12: same note as the previous button -- margin logicalized
                        (ms-0.5), icon-direction-under-RTL left as a human design call. */}
                    <ChevronRight className="ms-0.5" size={28} />
                  </button>
                </div>
              </div>

              {/* Pagination Indicator (Moved below the slider) */}
              <div className="mt-8 flex justify-center gap-3">
                {accommodationFacilitiesImage &&
                  accommodationFacilitiesImage.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        activeSlide === i
                          ? 'w-12 bg-brand-turquoise shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                          : 'w-2.5 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={activeSlide === i ? 'true' : undefined}
                    />
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AccommodationFacilities
