'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Sparkles, X } from 'lucide-react'

interface FacultyItem {
  name: string
  role?: string
  bio?: string
  photo?: {
    url: string
    alt?: string
  }
}

interface AboutLeadershipProps {
  title?: string
  subtitle?: string
  items?: FacultyItem[]
}

// Modal Component with Portal
const FacultyModal = ({
  member,
  onClose,
  sectionTitle,
}: {
  member: FacultyItem | null
  onClose: () => void
  sectionTitle?: string
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!member || !mounted) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-99999 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-brand-dark w-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[72vh]"
          >
            {/* Image Section */}
            <div className="w-full md:w-[42%] h-48 md:h-auto min-h-[400px] relative bg-black">
              {member.photo ? (
                <Image
                  src={member.photo.url}
                  alt={member.photo.alt || member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise to-brand-primary flex items-center justify-center">
                  <GraduationCap size={80} className="text-white/50" />
                </div>
              )}
              {/* Close Button Mobile */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:hidden p-2 bg-black/50 text-white rounded-full z-10 font-bold"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-[58%] py-8 px-4 md:p-8 overflow-y-auto bg-brand-dark">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {sectionTitle && (
                    <span className="inline-flex items-center gap-2 text-brand-turquoise text-xs font-bold tracking-widest uppercase mb-3">
                      <Sparkles size={12} />
                      {sectionTitle}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{member.name}</h2>
                  <p className="text-brand-turquoise text-lg font-medium tracking-wide uppercase">
                    {member.role || 'Faculty Member'}
                  </p>
                </div>
                {/* Close Button Desktop */}
                <button
                  onClick={onClose}
                  className="hidden md:block p-2 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="w-16 h-1 bg-brand-turquoise mb-8 rounded-full"></div>

              {member.bio ? (
                <div className="prose prose-invert max-w-none text-gray-300 mb-8 leading-relaxed">
                  <p className="whitespace-pre-line">{member.bio}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No biography available.</p>
              )}

              {/* Decorative Bottom */}
              <div className="border-t border-white/10 pt-6 mt-auto">
                <p className="text-sm text-gray-500">
                  Part of the dedicated team at GTNI committed to excellence in nursing education.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export const AboutLeadership = ({ title, subtitle, items }: AboutLeadershipProps) => {
  const [selectedMember, setSelectedMember] = useState<FacultyItem | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const openModal = useCallback((member: FacultyItem) => {
    setSelectedMember(member)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setSelectedMember(null)
    document.body.style.overflow = 'unset'
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeModal])

  // Use only CMS items - no mock data
  const displayItems = items || []

  if (!displayItems || displayItems.length === 0) return null
  if (!mounted) return null

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-turquoise/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-turquoise/50 to-transparent" />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-turquoise/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(83, 181, 178, 0.5) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-brand-turquoise text-sm font-bold tracking-[0.3em] uppercase mb-4"></span>
          <h2 className="lg:text-3xl md:text-2xl font-black text-brand-dark mb-4">
            {title || 'The Board Members'}
          </h2>
          {subtitle && <p className="text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
        </motion.div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayItems.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative cursor-pointer"
              onClick={() => openModal(member)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openModal(member)
                }
              }}
            >
              {/* Card Container */}
              <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-900 border border-white/5 group-hover:border-brand-turquoise/50 transition-colors duration-500 shadow-xl">
                {member.photo?.url ? (
                  <Image
                    src={member.photo.url}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise/20 to-brand-primary/20 flex items-center justify-center">
                    <GraduationCap size={48} className="text-white/30" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-dark  via-brand-dark/20 to-transparent opacity-100 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-brand-turquoise transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    {member.role || 'Faculty Member'}
                  </p>
                </div>

                {/* Hover Icon */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-brand-turquoise"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Render Modal via Portal */}
      {selectedMember && (
        <FacultyModal
          member={selectedMember}
          onClose={closeModal}
          sectionTitle={title || undefined}
        />
      )}
    </section>
  )
}
