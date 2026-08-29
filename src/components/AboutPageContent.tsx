'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Target, Eye } from 'lucide-react'
import RichText from './RichText'

import type { AboutGtni } from '@/payload-types'

interface AboutPageContentProps {
  mission?: AboutGtni['mission']
  vision?: AboutGtni['vision']
  stats?: {
    yearsOfExcellence?: number
    graduates?: number
    facultyMembers?: number
    employmentRate?: number
  }
}

export const AboutPageContent: React.FC<AboutPageContentProps> = ({ mission, vision }) => {
  return (
    <>
      {/* ===== MISSION & VISION SPLIT SECTION ===== */}
      {(mission || vision) && (
        <section className="relative py-32 bg-white overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-brand-turquoise/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-stretch">
              {/* Mission Card */}
              {mission && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] as const }}
                  className="relative group h-full"
                >
                  <div className="absolute -inset-4 bg-linear-to-r from-brand-turquoise/20 to-cyan-400/20 rounded-4xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-brand-dark text-white rounded-4xl p-10 shadow-2xl shadow-brand-dark/5 border border-gray-100 hover:border-brand-turquoise/30 transition-all duration-500 h-full flex flex-col">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-brand-turquoise to-brand-turquoise/90 flex items-center justify-center mb-8 shadow-xl shadow-brand-turquoise/30 group-hover:scale-110 transition-transform duration-500">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    {/* Title */}
                    <h2 className="lg:text-3xl md:text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                      Our Mission
                      <Sparkles className="w-6 h-6 text-brand-turquoise" />
                    </h2>
                    {/* Content */}
                    <div className="prose prose-lg prose-p:text-gray-600 prose-p:leading-relaxed max-w-none grow">
                      <RichText content={mission} />
                    </div>
                    {/* Decorative element */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-turquoise/5 rounded-tl-full pointer-events-none" />
                  </div>
                </motion.div>
              )}

              {/* Vision Card */}
              {vision && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] as const }}
                  className="relative group h-full"
                >
                  <div className="absolute -inset-4 bg-linear-to-r from-brand-primary/20 to-indigo-400/20 rounded-4xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-brand-turquoise text-white rounded-4xl p-10 shadow-2xl shadow-brand-dark/5 border border-gray-100 hover:border-brand-primary/30 transition-all duration-500 h-full flex flex-col">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-brand-dark to-brand-dark/90 flex items-center justify-center mb-8 shadow-xl shadow-brand-turquoise/30 group-hover:scale-110 transition-transform duration-500">
                      <Eye className="w-10 h-10 text-white" />
                    </div>
                    {/* Title */}
                    <h2 className="lg:text-3xl md:text-2xl   font-black text-white tracking-tight mb-6 flex items-center gap-3">
                      Our Vision
                      <Sparkles className="w-6 h-6 text-brand-primary" />
                    </h2>
                    {/* Content */}
                    <div className="prose prose-lg prose-p:text-gray-600 prose-p:leading-relaxed max-w-none grow">
                      <RichText content={vision} />
                    </div>
                    {/* Decorative element */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-tl-full pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== ANIMATED STATS BAR ===== */}
      {/* <section className="relative py-20 mb-20 bg-brand-dark overflow-hidden">
         <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(83, 181, 178, 0.5) 1px, transparent 0)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-turquoise/20 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.19, 1, 0.22, 1] as const,
                }}
                className="text-center group"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${stat.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="lg:text-3xl md:text-2xl font-black text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-brand-turquoise/80 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ===== CALL TO ACTION ===== */}
      {/* <section className="relative py-24 bg-linear-to-br from-brand-turquoise via-brand-primary to-brand-dark overflow-hidden">
         <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="about-pattern"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-pattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join GTNI and become part of a legacy of excellence in nursing education
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/admission"
                className="group relative inline-flex items-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Apply Now
                <span className="w-8 h-8 rounded-full bg-brand-turquoise text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  →
                </span>
              </a>
              <a
                href="/nursing-programs"
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                Explore Programs
              </a>
            </div>
          </motion.div>
        </div>
      </section> */}
    </>
  )
}
