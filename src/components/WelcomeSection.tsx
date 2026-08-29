'use client'

import React from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/animations/AnimatedSection'
import Image from 'next/image'
import RichText from '@/components/RichText'

import { Home } from '@/payload-types'

interface WelcomeSectionProps {
  title: string
  content: NonNullable<Home['welcome']>['content']
  signature?: string
  signatureImage?: NonNullable<Home['welcome']>['signatureImage']
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  title,
  content,
  signature,
  signatureImage,
}) => {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* --- Decorative Background Objects --- */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -right-20 -top-20 z-0 h-96 w-96 rounded-full bg-brand-turquoise/10 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-32 -left-20 z-0 h-[500px] w-[500px] rounded-full bg-brand-dark/5 blur-[120px]"
      />

      <div className="absolute inset-0 z-0 opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[40px_40px]" />

      <div className="container relative z-10 mx-auto max-w-[1300px] px-4">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-start">
          {/* --- Main Content Column (7 cols) --- */}
          <div className="lg:col-span-7">
            <AnimatedSection variant="fade-up">
              <div className="mb-6 flex items-center space-x-3">
                <span className="h-px w-12 bg-brand-turquoise" />
              </div>
              <h2 className="mb-8 bg-linear-to-r from-brand-dark to-brand-dark/70 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent md:text-2xl lg:text-3xl">
                {title}
              </h2>
            </AnimatedSection>

            <AnimatedSection variant="fade-up" delay={0.2}>
              <div className="relative mb-12">
                <div className="pointer-events-none absolute -left-8 -top-8 select-none text-8xl font-serif text-brand-turquoise/10">
                  &ldquo;
                </div>
                {content && (
                  <RichText
                    content={content}
                    className="relative z-10 text-lg text-gray-600  prose-p:mb-6 last:prose-p:mb-0"
                  />
                )}
              </div>
            </AnimatedSection>

            {/* Signature Name & Title */}
            {signature && (
              <AnimatedSection
                variant="fade-up"
                delay={0.3}
                className="mb-12 border-l-4 border-brand-turquoise pl-6"
              >
                <p className="lg:text-xl md:text-lg font-bold text-brand-dark">{signature}</p>
                <p className="text-sm font-medium uppercase tracking-wider text-brand-turquoise mt-1">
                  Founding Dean of GTNI, Board Member, and Expert Consultant.
                </p>
              </AnimatedSection>
            )}
          </div>

          {/* --- Image Column (5 cols) --- */}
          <div className="relative lg:col-span-5">
            <AnimatedSection variant="fade-left" delay={0.3}>
              <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-gray-100 shadow-2xl">
                {/* Decorative border element */}
                <div className="absolute inset-4 rounded-3xl border-2 border-white/30 z-10 pointer-events-none" />

                {signatureImage &&
                typeof signatureImage === 'object' &&
                'url' in signatureImage &&
                signatureImage.url ? (
                  <Image
                    src={signatureImage.url}
                    alt="Chairman Portrait"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-dark/5 text-brand-dark/20 text-4xl">
                    GTNI
                  </div>
                )}

                {/* Glassmorphism Bottom Overlay */}
                <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-brand-dark/80 via-brand-dark/40 to-transparent p-10 pt-20">
                  <div className="flex items-center space-x-3">
                    {/* <div className="h-2 w-2 rounded-full bg-brand-turquoise animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-turquoise/90">
                      Our Commitment to Excellence
                    </span> */}
                  </div>
                </div>
              </div>

              {/* Decorative element behind the image */}
              <div className="absolute -bottom-10 -right-10 -z-10 h-3/4 w-3/4 rounded-full bg-brand-turquoise/10 blur-3xl" />
              <div className="absolute -top-10 -left-10 -z-10 h-32 w-32 rounded-full border border-brand-turquoise/20" />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection
