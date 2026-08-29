'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Clock, ChevronRight, Check, ClipboardList } from 'lucide-react'
import RichText from '@/components/RichText'
import Link from 'next/link'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface Course {
  id?: string
  courseCode?: string
  courseTitle?: string
  classHours?: number
  clinicalHours?: number
  totalCourseHours?: number
  totalCredit?: number
  prerequisites?: string
  corequisites?: string
}

interface Semester {
  id?: string
  name?: string
  weeks?: number
  tabLabel?: string
  description?: string
  courses?: Course[]
}

import { Course as PayloadCourse } from '@/payload-types'

interface CoursesContentProps {
  overviewTitle?: string
  overviewContent?: PayloadCourse['overviewContent']
  creditHoursTitle?: string
  creditHoursDescription?: string
  creditHoursRules?: string
  semesters?: Semester[]
  competencyTitle?: string
  competencyDescription?: string
  clinicalHoursMin?: string
  clinicalHoursMax?: string
  clinicalHoursText?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] as const },
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseLines(text?: string): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

// Helper to check if Lexical rich text content is empty
function isRichTextEmpty(content: unknown): boolean {
  if (!content || typeof content !== 'object') return true
  const root = (content as { root?: { children?: unknown[] } }).root
  const children = root?.children
  if (!children || !Array.isArray(children) || children.length === 0) return true

  // Check if it only contains empty paragraphs or empty text nodes
  return children.every((child) => {
    if (!child || typeof child !== 'object') return true
    const c = child as { children?: unknown[]; type?: string }
    if (Array.isArray(c.children)) {
      if (c.children.length === 0) return true
      return c.children.every((subChild) => {
        if (!subChild || typeof subChild !== 'object') return true
        return (subChild as { text?: string }).text === ''
      })
    }
    return false
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function CoursesContent({
  overviewTitle,
  overviewContent,
  creditHoursTitle,
  creditHoursDescription,
  creditHoursRules,
  semesters,
  competencyTitle,
  competencyDescription,
  clinicalHoursMin,
  clinicalHoursMax,
  clinicalHoursText,
}: CoursesContentProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: OVERVIEW */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {(overviewTitle || !isRichTextEmpty(overviewContent)) && (
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-turquoise/5 rounded-full blur-[150px]" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl relative z-10"
          >
            {overviewTitle && (
              <motion.h2
                variants={itemVariants}
                className="lg:text-3xl md:text-2xl text-xl font-bold text-brand-dark mb-8"
              >
                {overviewTitle}
              </motion.h2>
            )}

            {!isRichTextEmpty(overviewContent) && (
              <motion.div
                variants={itemVariants}
                className="prose prose-lg prose-p:text-gray-600 prose-p:leading-relaxed max-w-none"
              >
                <RichText content={overviewContent as Parameters<typeof RichText>[0]['content']} />
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: CREDIT HOURS SYSTEM */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {(creditHoursTitle || creditHoursDescription || creditHoursRules) && (
        <section className="py-24 bg-white relative overflow-hidden">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl relative z-10"
          >
            {/* Faded Background Icon (Bounded to container) */}
            <div className="absolute top-1/2 inset-e-0 -translate-y-1/2 opacity-80 text-brand-dark/70 pointer-events-none hidden md:block">
              <div className="relative">
                <ClipboardList size={380} className="text-brand-dark" strokeWidth={1.5} />
                <div className="absolute -bottom-8 -inset-e-8 bg-white rounded-full p-2">
                  <Clock size={200} className="text-brand-dark" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Content Column */}
              <div className="lg:col-span-8">
                {creditHoursTitle && (
                  <motion.h2
                    variants={itemVariants}
                    className="text-2xl md:text-3xl font-bold text-brand-dark mb-4"
                  >
                    {creditHoursTitle}
                  </motion.h2>
                )}

                {creditHoursDescription && (
                  <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl"
                  >
                    {creditHoursDescription}
                  </motion.p>
                )}

                {creditHoursRules && parseLines(creditHoursRules).length > 0 && (
                  <div className="space-y-6">
                    {parseLines(creditHoursRules).map((rule, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-start gap-6 group"
                      >
                        <div className="shrink-0 w-14 h-14 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200 group-hover:bg-brand-turquoise/10 group-hover:border-brand-turquoise/30 transition-all duration-300">
                          <Check
                            className="text-brand-dark group-hover:text-brand-turquoise transition-colors"
                            size={28}
                            strokeWidth={2.5}
                          />
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed pt-3 group-hover:text-brand-dark font-medium transition-colors">
                          {rule}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Spacing Column */}
              <div className="hidden lg:block lg:col-span-4" />
            </div>
          </motion.div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: SEMESTERS TABS */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {semesters && semesters.length > 0 && (
        <section className="py-20 bg-brand-dark min-h-[80vh] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(83, 181, 178, 0.5) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand-turquoise/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-brand-primary/20 rounded-full blur-[80px]" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl relative z-10"
          >
            {/* Section Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Program Semesters</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Our comprehensive nursing program spans 6 semesters, each designed to build upon the
                previous
              </p>
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-2 mb-12"
            >
              {semesters.map((semester, index) => {
                return (
                  <button
                    key={semester.id || index}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === index
                        ? 'bg-brand-turquoise text-white shadow-lg shadow-brand-turquoise/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="hidden md:inline">
                      {semester.tabLabel || semester.name?.split(' ')[0]}
                    </span>
                    <span className="md:hidden">{semester.tabLabel?.slice(0, 4) || index + 1}</span>
                    {semester.weeks && (
                      <span className="text-xs opacity-70 hidden lg:inline">
                        ({semester.weeks}w)
                      </span>
                    )}
                  </button>
                )
              })}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden min-h-[52vh]"
              >
                {/* Semester Header */}
                <div className="bg-brand-turquoise/20 px-8 py-6 border-b border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {semesters[activeTab]?.name}
                    {semesters[activeTab]?.weeks && (
                      <span className="text-brand-turquoise ml-2">
                        ({semesters[activeTab]?.weeks} Weeks)
                      </span>
                    )}
                  </h3>
                  {semesters[activeTab]?.description && (
                    <p className="text-white/70">{semesters[activeTab]?.description}</p>
                  )}
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider">
                          Course Title
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider text-center">
                          Class Hrs
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider text-center">
                          Clinical Hrs
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider text-center">
                          Total Hrs
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider text-center">
                          Credits
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">
                          Pre-req
                        </th>
                        <th className="px-6 py-4 text-white/50 font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">
                          Co-req
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesters[activeTab]?.courses?.map((course, idx) => (
                        <tr
                          key={course.id || idx}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 text-brand-turquoise font-bold">
                            {course.courseCode}
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{course.courseTitle}</td>
                          <td className="px-6 py-4 text-white/70 text-center">
                            {course.classHours || 0}
                          </td>
                          <td className="px-6 py-4 text-white/70 text-center">
                            {course.clinicalHours || 0}
                          </td>
                          <td className="px-6 py-4 text-white/70 text-center">
                            {course.totalCourseHours || 0}
                          </td>
                          <td className="px-6 py-4 text-brand-turquoise font-bold text-center">
                            {course.totalCredit || 0}
                          </td>
                          <td className="px-6 py-4 text-white/50 hidden lg:table-cell">
                            {course.prerequisites || '-'}
                          </td>
                          <td className="px-6 py-4 text-white/50 hidden lg:table-cell">
                            {course.corequisites || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {(!semesters[activeTab]?.courses ||
                    semesters[activeTab]?.courses?.length === 0) && (
                    <div className="text-center py-12 text-white/50">
                      No courses added yet. Add courses in the admin panel.
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Competency-based curriculum */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {(competencyTitle || competencyDescription || clinicalHoursMin || clinicalHoursMax) && (
        <section className="py-24 bg-white relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="container mx-auto px-4 max-w-7xl"
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              {(competencyTitle || competencyDescription) && (
                <motion.div variants={itemVariants}>
                  {competencyTitle && (
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4">
                      {competencyTitle}
                    </h2>
                  )}

                  {competencyDescription && parseLines(competencyDescription).length > 0 && (
                    <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-justify">
                      {parseLines(competencyDescription).map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Right Content (Statistics) */}
              {(clinicalHoursMin || clinicalHoursMax) && (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center text-center lg:px-8"
                >
                  <div
                    dir="ltr"
                    className="flex items-center justify-center gap-6 text-brand-dark mb-4"
                  >
                    {clinicalHoursMin && (
                      <span className="text-7xl md:text-8xl font-light tracking-tighter">
                        {clinicalHoursMin}
                      </span>
                    )}

                    <div className="flex flex-col items-center justify-center -mt-2">
                      <span className="text-2xl font-bold text-brand-turquoise mb-2">180</span>
                      <svg
                        width="120"
                        height="24"
                        viewBox="0 0 120 24"
                        fill="none"
                        className="text-brand-turquoise"
                      >
                        <path
                          d="M0 12H118M118 12L108 2M118 12L108 22"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {clinicalHoursMax && (
                      <span className="text-7xl md:text-8xl font-light tracking-tighter">
                        {clinicalHoursMax}
                      </span>
                    )}
                  </div>

                  {clinicalHoursText && (
                    <p className="text-gray-500 text-lg md:text-xl font-medium px-4">
                      {clinicalHoursText}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: CTA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-linear-to-r from-brand-turquoise to-brand-light relative overflow-hidden">
        {/* Grid Pattern */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Nursing Journey?{' '}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Apply now and join our community of future nurses and healthcare professionals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={'/admission'}
              className="inline-flex items-center gap-2 bg-white text-brand-dark px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-black/20 hover:scale-105 transition-transform"
            >
              Apply Now
              <ChevronRight size={20} />
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
