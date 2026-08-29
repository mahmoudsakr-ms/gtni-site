'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Search, Send, Sparkles, X, Mail } from 'lucide-react'
import Image from 'next/image'
import RichText from '@/components/RichText'
import RunawayTriangles from './PhysicsTriangle'

import { Vacancy } from '@/payload-types'

// --- Type Definitions ---
type Position = NonNullable<Vacancy['positions']>[number]

interface VacanciesPageData {
  heroTitle?: string
  heroDescription?: string
  heroImage?: Vacancy['heroImage']
  overview?: Vacancy['overview']
  positions?: Position[]
  applicationEmail?: string
}

// --- Animation Variants ---
const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// --- Component ---
export default function VacanciesClient({ data }: { data: VacanciesPageData }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | 'all'>('all')

  // Filter Positions
  const filteredPositions = useMemo(() => {
    if (!data.positions) return []
    return data.positions.filter((pos) => {
      const matchesSearch =
        pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.department?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || pos.type === selectedType
      // Filter out drafts unless explicitly handled (assuming we only want published)
      const isPublished = pos.status === 'published' || !pos.status // Default to published if undefined for backward compatibility

      return matchesSearch && matchesType && isPublished
    })
  }, [data.positions, searchTerm, selectedType])

  const jobTypes = ['full-time', 'part-time', 'contract']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 1: HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {data.heroImage && typeof data.heroImage !== 'number' && data.heroImage.url ? (
          <div className="absolute inset-0">
            <Image
              src={data.heroImage.url}
              alt="Vacancies Hero Image"
              className="w-full h-full object-cover scale-110"
              style={{ transform: 'translateZ(0)' }}
            />
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
            {/* <div className="absolute inset-0 bg-linear-to-r from-brand-dark/80 to-transparent" /> */}
            {/* <div className="absolute inset-0 bg-brand-dark/20" /> */}
          </div>
        ) : (
          /* Premium Animated Background when no image */
          <div className="absolute inset-0 bg-brand-dark">
            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-turquoise/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-64 h-64 bg-linear-to-br from-brand-turquoise/30 to-brand-primary/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '2s' }}
            />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <svg
            className="absolute -right-20 -top-20 w-96 h-96 text-brand-turquoise/10"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Floating Shapes - Interactive Runaway Triangles */}
        <RunawayTriangles />
        <div
          className="absolute top-40 right-20 w-16 h-16 border border-brand-turquoise/20 rounded-full animate-bounce"
          style={{ animationDuration: '4s' }}
        />

        {/* Hero Content */}
        <div className="container mx-auto max-w-7xl px-4 relative z-10 py-32">
          <div className="mx-auto max-w-4xl items-center flex flex-col text-center">
            {/* Breadcrumb / Category Tag */}
            <div className="inline-flex items-center gap-2 mb-6">
              {/* <span className="w-12 h-px bg-brand-turquoise" /> */}
              {/* <span className="text-brand-turquoise text-sm font-semibold tracking-[0.3em] uppercase">
                      {pageType?.replace('-', ' ') || 'GTNI'}
                    </span> */}
            </div>

            {/* Title with Gradient Effect */}
            {data.heroTitle && (
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-6">
                <span className="inline-block">{data.heroTitle}</span>
              </h1>
            )}

            {/* Subtitle */}
            {data.heroDescription && (
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed font-light">
                {data.heroDescription}
              </p>
            )}

            {/* Decorative Line */}
            {data.heroTitle && (
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-linear-to-r from-brand-turquoise to-brand-primary rounded-full" />
                <div className="w-3 h-3 bg-brand-turquoise rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 2: OVERVIEW & FILTER
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20  relative z-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Overview Card */}
          {data.overview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16 border border-gray-100"
            >
              <div className="prose prose-lg prose-headings:text-brand-dark prose-p:text-gray-600 max-w-none text-center">
                <RichText content={data.overview} />
              </div>
            </motion.div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 sticky top-24 z-30">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-brand-turquoise focus:ring-4 focus:ring-brand-turquoise/10 outline-none transition-all shadow-lg shadow-gray-100/50 text-brand-dark font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border ${
                  selectedType === 'all'
                    ? 'bg-brand-dark text-white border-brand-dark shadow-lg'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand-turquoise/50 hover:text-brand-turquoise'
                }`}
              >
                All Types
              </button>
              {jobTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap capitalize transition-all border ${
                    selectedType === type
                      ? 'bg-brand-turquoise text-brand-dark border-brand-turquoise shadow-lg'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-turquoise/50 hover:text-brand-turquoise'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
             SECTION 3: POSITIONS LIST
          ════════════════════════════════════════════════════════════════════════ */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPositions.length > 0 ? (
                filteredPositions.map((position, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-turquoise/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  >
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-linear-to-r from-brand-turquoise/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {position.department && (
                            <span className="text-sm font-bold text-brand-turquoise uppercase tracking-wider bg-brand-turquoise/10 px-3 py-1 rounded-full">
                              {position.department}
                            </span>
                          )}
                          {position.type && (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                              {position.type.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors">
                          {position.title}
                        </h3>
                        <div className="flex items-center gap-6 text-gray-500 text-sm">
                          <span className="flex items-center gap-2">
                            <MapPin size={16} /> Gouna, Red Sea
                          </span>
                          {position.deadline && (
                            <span className="flex items-center gap-2">
                              <Clock size={16} />
                              Deadline: {new Date(position.deadline).toLocaleDateString('en-GB')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <motion.a
                          href={
                            data.applicationEmail
                              ? `mailto:${data.applicationEmail}?subject=Application for ${position.title}`
                              : '#'
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 md:flex-none uppercase tracking-wide px-8 py-4 bg-brand-dark text-white font-bold rounded-xl flex items-center justify-center gap-3 group-hover:bg-brand-turquoise group-hover:text-brand-dark transition-colors shadow-lg"
                        >
                          Apply Now <Send size={18} />
                        </motion.a>
                      </div>
                    </div>

                    {/* Description & Requirements */}
                    {(position.description || position.requirements) && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        {position.description && (
                          <div className="prose prose-sm prose-gray max-w-none mb-4">
                            <RichText content={position.description} />
                          </div>
                        )}
                        {position.requirements && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/50">
                            <p className="text-sm text-gray-600">
                              <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wide text-xs">
                                Requirements:
                              </span>
                              {position.requirements}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No positions found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 4: CTA
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden mt-auto">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Sparkles size={48} className="text-brand-turquoise mx-auto mb-6" />
            <h2 className="lg:text-3xl md:text-2xl text-xl font-bold mb-6">
              Don&apos;t see the right role?
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              We represent a diverse team of professionals. Send us your CV and we&apos;ll keep it
              on file for future opportunities.
            </p>
            <a
              href={data.applicationEmail ? `mailto:${data.applicationEmail}` : '#'}
              className="inline-flex items-center gap-3 px-10 py-5 bg-brand-turquoise text-brand-dark font-bold text-lg rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-2xl shadow-brand-turquoise/20"
            >
              <Mail size={22} />
              Send Spontaneous Application
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
