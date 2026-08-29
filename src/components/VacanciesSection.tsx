'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Mail, Clock, Building2, Sparkles, Send } from 'lucide-react'
import RichText from '@/components/RichText'

import { Vacancy } from '@/payload-types'

// Use types derived from Payload

interface VacanciesSectionProps {
  overview?: Vacancy['overview']
  positions?: Vacancy['positions']
  applicationEmail?: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] as const },
  },
}

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  'full-time': { bg: 'bg-green-100', text: 'text-green-700', label: 'Full-Time' },
  'part-time': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Part-Time' },
  contract: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Contract' },
}

export function VacanciesSection({ overview, positions, applicationEmail }: VacanciesSectionProps) {
  return (
    <>
      {/* ============================================ */}
      {/* SECTION 1: OVERVIEW - White Background */}
      {/* ============================================ */}
      {overview && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-brand-turquoise/3 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-5xl relative z-10"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-brand-turquoise text-sm font-bold tracking-[0.3em] uppercase mb-4">
                <Briefcase size={16} />
                Career Opportunities
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark">Join Our Team</h2>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="prose prose-xl prose-p:text-gray-600 prose-p:leading-relaxed max-w-none"
            >
              {overview && <RichText content={overview} />}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 2: POSITIONS GRID - Light Gradient */}
      {/* ============================================ */}
      {positions && positions.length > 0 && (
        <section className="py-24 bg-linear-to-b from-zinc-50 to-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 border-2 border-brand-turquoise/10 rounded-full" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-brand-primary/10 rotate-45" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-4xl relative z-10"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-brand-turquoise text-sm font-bold tracking-[0.3em] uppercase mb-4">
                <Building2 size={16} />
                Current Openings
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark">Open Positions</h2>
              <p className="text-xl text-gray-500 mt-4">
                {positions.length} position{positions.length !== 1 ? 's' : ''} available
              </p>
            </motion.div>

            <div className="space-y-6">
              {positions.map((position, index) => {
                const style = typeStyles[position.type || 'full-time'] || typeStyles['full-time']

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    className="group bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-brand-turquoise/30 hover:shadow-brand-turquoise/10 transition-all duration-500"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors duration-300">
                          {position.title}
                        </h3>
                        {position.department && (
                          <div className="flex items-center gap-2 text-gray-500 mt-2">
                            <Building2 size={16} />
                            <span>{position.department}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {position.type && (
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        )}
                        {position.deadline && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock size={14} />
                            <span>
                              Deadline:{' '}
                              {new Date(position.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {position.description && (
                      <div className="prose prose-gray prose-p:text-gray-600 prose-p:leading-relaxed max-w-none mb-4">
                        <RichText content={position.description} />
                      </div>
                    )}

                    {position.requirements && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-brand-dark">Requirements: </span>
                          {position.requirements}
                        </p>
                      </div>
                    )}

                    {/* Apply button */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <motion.a
                        href={applicationEmail ? `mailto:${applicationEmail}` : '#'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 bg-brand-turquoise/10 text-brand-turquoise px-6 py-3 rounded-full font-semibold hover:bg-brand-turquoise hover:text-white transition-all duration-300"
                      >
                        <Send size={18} />
                        Apply for this position
                      </motion.a>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 3: NO POSITIONS - Empty State */}
      {/* ============================================ */}
      {(!positions || positions.length === 0) && !overview && (
        <section className="py-24 bg-white relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Briefcase size={36} className="text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-brand-dark mb-4">No Open Positions</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              We don&apos;t have any open positions at the moment, but check back soon for new
              opportunities!
            </p>
          </motion.div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 4: APPLICATION EMAIL CTA - Brand Gradient */}
      {/* ============================================ */}
      {applicationEmail && (
        <section className="py-20 bg-linear-to-r from-brand-turquoise to-brand-primary relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Glowing orbs */}
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-[60px]" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full blur-[80px]" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <Sparkles size={48} className="text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Join Our Team?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Send your CV and application to our HR team. We look forward to hearing from you!
            </p>

            <motion.a
              href={`mailto:${applicationEmail}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow"
            >
              <Mail size={24} />
              {applicationEmail}
            </motion.a>
          </motion.div>
        </section>
      )}
    </>
  )
}
