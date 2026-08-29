'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { SmartText } from './SmartText'

interface FeatureCard {
  id: string | number
  title: string
  slug: string
  cardImage: string | null
  cardTitle: string | null
  order: number
}

interface FeatureCardsSectionProps {
  cards: FeatureCard[]
}

export const FeatureCardsSection: React.FC<FeatureCardsSectionProps> = ({ cards }) => {
  // Sort cards by order
  const sortedCards = [...cards].sort((a, b) => a.order - b.order)

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 bg-brand-dark">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-turquoise/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-br from-brand-turquoise/5 to-brand-primary/5 rounded-full blur-3xl" />

        {/* Premium Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating Particles - Fixed positions to avoid hydration mismatch */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '10%', top: '20%', delay: '0s', duration: '3s' },
            { left: '25%', top: '60%', delay: '0.5s', duration: '4s' },
            { left: '40%', top: '15%', delay: '1s', duration: '3.5s' },
            { left: '55%', top: '75%', delay: '1.5s', duration: '4.5s' },
            { left: '70%', top: '30%', delay: '2s', duration: '3s' },
            { left: '85%', top: '55%', delay: '0.3s', duration: '4s' },
            { left: '15%', top: '80%', delay: '1.2s', duration: '3.5s' },
            { left: '60%', top: '45%', delay: '0.8s', duration: '4s' },
            { left: '80%', top: '85%', delay: '1.7s', duration: '3s' },
            { left: '35%', top: '90%', delay: '2.2s', duration: '4.5s' },
            { left: '90%', top: '10%', delay: '0.6s', duration: '3.5s' },
            { left: '5%', top: '50%', delay: '1.4s', duration: '4s' },
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-brand-turquoise/30 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="container mx-auto px-4 relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-3 mb-6">
            {/* <span className="w-12 h-px bg-brand-turquoise" />
            <span className="text-brand-turquoise text-sm font-bold tracking-[0.4em] uppercase">
              Explore
            </span> */}
            {/* <span className="w-12 h-px bg-brand-turquoise" /> */}
          </span>
          <h2 className="lg:text-3xl md:text-2xl font-bold text-white mb-4">
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-turquoise to-cyan-300">
              GTNI
            </span>
          </h2>
          {/* <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore everything our institute has to offer
          </p> */}
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {sortedCards.map((card, _index) => (
            <motion.div key={card.id} variants={cardVariants} className="group relative">
              <Link href={`/${card.slug}`} className="block">
                <div className="relative aspect-4/3  rounded-3xl overflow-hidden">
                  {/* Card Background */}
                  {card.cardImage ? (
                    <div className="absolute inset-0">
                      <Image
                        src={card.cardImage}
                        alt={card.cardTitle || card.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Multi-layer Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise/20 to-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  ) : (
                    /* Animated Gradient Background when no image */
                    <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-900">
                      <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise/10 to-brand-primary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Pattern */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0, 240, 255, 0.3) 1px, transparent 0)`,
                          backgroundSize: '24px 24px',
                        }}
                      />
                    </div>
                  )}

                  {/* Glassmorphism Border */}
                  <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-brand-turquoise/30 transition-colors duration-500" />

                  {/* Glow Effect on Hover */}
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-turquoise/0 via-brand-turquoise/20 to-brand-turquoise/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10" />

                  {/* Card Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    {/* Number Badge */}
                    {/* <div className="absolute top-6 right-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-brand-turquoise/20 group-hover:border-brand-turquoise/30 transition-all duration-500">
                        <span className="text-white/70 text-lg font-bold group-hover:text-white transition-colors">
                          0{index + 1}
                        </span>
                      </div>
                    </div> */}

                    {/* Title with animated underline */}
                    <div className="relative">
                      <h3 className="lg:text-3xl md:text-2xl font-bold text-white tracking-wide leading-tight mb-3 group-hover:text-brand-turquoise transition-colors duration-300">
                        {(card.cardTitle || card.title).split('\n').map((line, i) => (
                          <span key={i} className="block">
                            <SmartText text={line} />
                          </span>
                        ))}
                      </h3>

                      {/* Animated Line */}
                      <div className="flex items-center gap-3">
                        <div className="h-1 bg-linear-to-r from-brand-turquoise to-brand-primary rounded-full w-12 group-hover:w-24 transition-all duration-500" />
                        <div className="w-2 h-2 rounded-full bg-brand-turquoise animate-pulse" />
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <div className="w-12 h-12 rounded-full bg-brand-turquoise flex items-center justify-center shadow-lg shadow-brand-turquoise/30">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/0 group-hover:border-brand-turquoise/50 rounded-tl-3xl transition-colors duration-300" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/0 group-hover:border-brand-turquoise/50 rounded-br-3xl transition-colors duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-turquoise/30 to-transparent" />
    </section>
  )
}
