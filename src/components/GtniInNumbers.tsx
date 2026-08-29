'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { GraduationCap, TrendingUp, Briefcase, Award, Users, Clock } from 'lucide-react'

// ============================================
// INTERFACES
// ============================================
export interface GtniInNumbersProps {
  sectionTitle?: string
  stats?: {
    label: string
    value: string
    description?: string
  }[]
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
// MAIN COMPONENT
// ============================================
export function GtniInNumbers({ sectionTitle, stats }: GtniInNumbersProps) {
  if (!stats || stats.length === 0) return null

  return (
    <section className="py-24  bg-linear-to-br from-brand-dark to-brand-light relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-brand-turquoise/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-white mb-4">
            {sectionTitle || 'GTNI In Numbers'}
          </h2>
          <div className="w-24 h-1.5 bg-brand-turquoise mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index: number) => {
            // Optimized keyword-to-icon mapping
            let StatIcon = GraduationCap
            const label = stat.label.toLowerCase()

            if (label.includes('graduate')) StatIcon = GraduationCap
            if (label.includes('rate') || label.includes('%')) StatIcon = TrendingUp
            if (label.includes('job') || label.includes('work') || label.includes('placement'))
              StatIcon = Briefcase
            if (
              label.includes('accredit') ||
              label.includes('award') ||
              label.includes('certif') ||
              label.includes('اعتماد')
            )
              StatIcon = Award
            if (label.includes('student') || label.includes('member')) StatIcon = Users
            if (label.includes('year') || label.includes('time')) StatIcon = Clock

            const isAccreditation = label.includes('accredit') || label.includes('اعتماد')

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-brand-turquoise/30 transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-brand-turquoise/20 flex items-center justify-center text-brand-turquoise mb-6 group-hover:scale-110 transition-transform duration-500">
                    <StatIcon size={32} />
                  </div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, type: 'spring' }}
                    className="text-4xl md:text-5xl font-black text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>

                  <h3 className="text-brand-turquoise font-bold uppercase tracking-widest text-sm mt-2 mb-3">
                    {stat.label}
                  </h3>

                  {stat.description && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">
                      {stat.description}
                    </p>
                  )}

                  {isAccreditation && (
                    <a
                      href="https://www.acenursing.org/acen-programs-05202024/el-gouna-technical-nursing-institute-gtni"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-2 inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider hover:text-brand-turquoise transition-colors"
                    >
                      View Accreditation Status
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
