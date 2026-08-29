'use client'

import React from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/animations/AnimatedSection'
import { SmartText } from '@/components/SmartText'

interface AnnouncementSectionProps {
  line1?: string
  line2?: string
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({
  line1 = 'BE A PART OF AN EXCITING FUTURE',
  line2 = 'EDUCATING , INSPIRING , ENABLEING',
}) => {
  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Top line - spans a long width but responsive */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'circOut' }}
            className="w-full max-w-5xl h-[1.5px] bg-brand-turquoise mb-10 origin-center"
          />

          <AnimatedSection variant="fade-up">
            <div className="text-center px-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark tracking-[0.25em] mb-6 uppercase">
                <SmartText text={line1} />
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:text-base font-bold text-brand-dark/70 tracking-[0.45em] uppercase">
                {line2.split(',').map((word, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="whitespace-nowrap transition-colors hover:text-brand-turquoise cursor-default">
                      <SmartText text={word.trim()} />
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-brand-turquoise font-bold opacity-60">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Bottom line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'circOut', delay: 0.1 }}
            className="w-full max-w-5xl h-[1.5px] bg-brand-turquoise mt-10 origin-center"
          />
        </div>
      </div>
    </section>
  )
}

export default AnnouncementSection
