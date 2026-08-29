'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import { SmartText } from './SmartText'

interface TestimonialItem {
  id: string
  image: {
    url: string
    alt?: string
  }
  studentName?: string
  quote: string
  jobTitle?: string | null
}

interface StudentTestimonialsProps {
  title?: string
  items: TestimonialItem[]
}

export const StudentTestimonialsClient = ({ title, items }: StudentTestimonialsProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  // Use only CMS items - no mock data
  const displayItems = items || []

  // Early return if no testimonials from CMS
  if (displayItems.length === 0) {
    return null
  }

  // Calculate how many pairs we can show (2 at a time)
  const itemsPerView = 2
  const totalSlides = Math.ceil(displayItems.length / itemsPerView)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Get current visible items (2 at a time)
  const visibleItems = displayItems.slice(
    activeIndex * itemsPerView,
    activeIndex * itemsPerView + itemsPerView,
  )

  return (
    <section className="relative py-24 mb-24 bg-brand-dark overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-20 w-96 h-96 rounded-full bg-brand-turquoise/10 blur-[150px]"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-brand-primary/10 blur-[120px]"
        />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(83, 181, 178, 0.4) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header Section */}
        <header className="text-center mb-16">
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-brand-turquoise text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <SmartText text="Voices of Alumni" />
          </motion.div> */}

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="lg:text-3xl md:text-2xl font-bold text-white mb-6  "
          >
            <SmartText text={title || ''} />
          </motion.h2>
          <div className="w-20 h-1 bg-brand-turquoise mx-auto rounded-full mb-8" />
        </header>

        {/* Main Testimonial Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <div className="flex justify-center md:justify-end gap-4 mb-8 md:absolute md:-top-24 md:right-0">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevSlide}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-turquoise transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-turquoise transition-all duration-300"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          )}

          {/* Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className={`grid grid-cols-1 gap-8 ${
                displayItems.length === 1 ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'
              }`}
            >
              {visibleItems.map((item, idx) => (
                <div key={item.id || idx} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative h-full flex flex-col bg-white/5 backdrop-blur-lg rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-brand-turquoise/40 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-turquoise/10"
                  >
                    {/* Top: Image Section */}
                    <div className="relative aspect-4/3 overflow-hidden">
                      {item.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.alt || 'Student Testimonial'}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-brand-dark flex items-center justify-center">
                          <GraduationCap size={64} className="text-white/10" />
                        </div>
                      )}

                      {/* Quote Badge */}
                      <div className="absolute bottom-6 left-6 w-12 h-12 bg-brand-turquoise rounded-2xl flex items-center justify-center shadow-xl shadow-brand-turquoise/30 group-hover:-translate-y-2 transition-transform duration-500">
                        <Quote size={20} className="text-brand-dark" fill="currentColor" />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Bottom: Content Section */}
                    <div className="p-8 md:p-10 flex-1 flex flex-col">
                      {/* Student Identity */}
                      <div className="mb-6">
                        <h4 className="lg:text-2xl md:text-xl font-bold text-white mb-1 group-hover:text-brand-turquoise transition-colors uppercase ">
                          {item.studentName || 'GTNI Graduate'}
                        </h4>
                        {item.jobTitle && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-px bg-brand-turquoise/40" />
                            <span className="text-brand-turquoise text-[10px] font-black uppercase tracking-[0.2em]">
                              {item.jobTitle}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* The Quote */}
                      <div className="relative flex-1">
                        <p className="text-white/70 text-lg leading-relaxed font-medium italic group-hover:text-white transition-colors">
                          &quot;{item.quote || ' '}&quot;
                        </p>
                      </div>

                      {/* Stars Decoration */}
                      {/* <div className="mt-8 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className="text-brand-turquoise"
                            fill="currentColor"
                          />
                        ))}
                      </div> */}
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-turquoise/5 rounded-full blur-2xl group-hover:bg-brand-turquoise/10 transition-colors" />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Dots Navigation */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? 'bg-brand-turquoise w-12 shadow-[0_0_15px_rgba(83,181,178,0.5)]'
                      : 'bg-white/10 w-3 hover:bg-white/30'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px w-32 bg-linear-to-r from-transparent to-white/10" />
          <div className="w-2 h-2 rounded-full bg-brand-turquoise/40" />
          <div className="h-px w-32 bg-linear-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  )
}
