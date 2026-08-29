'use client'

import React from 'react'
import Image from 'next/image'
import RichText from '@/components/RichText'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Target,
  ScrollText,
  ListChecks,
} from 'lucide-react'
import RunawayTriangles from './PhysicsTriangle'

// Field Types
import type { Admission } from '@/payload-types'

export const AdmissionClient: React.FC<{ data: Admission }> = ({ data }) => {
  const [activeImage, setActiveImage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImage(null)
      }
    }

    if (activeImage) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImage])

  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-gray-50">
      {/* ============================================ */}
      {/* PREMIUM HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {data.heroImage && typeof data.heroImage === 'object' && 'url' in data.heroImage ? (
          <div className="absolute inset-0">
            <Image
              src={data.heroImage.url || ''}
              alt={data.heroTitle || 'Admission Hero'}
              fill
              sizes="100vw"
              quality={100}
              priority
              className="object-cover scale-110"
              style={{ transform: 'translateZ(0)' }}
            />
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
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
        {/* ... (rest of simple content) ... */}

        {/* ... */}

        {/* LATER IN FILE: qualificationsContent handling */}
        {/* ... */}
        {/* I need to make sure I am replacing the right block. This ReplaceFileContent call is too large/risky if I try to do everything. I will use MultiReplace for precision. */}

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
              {/* <span className="text-brand-turquoise text-sm font-semibold tracking-[0.3em] ">
                     {pageType?.replace('-', ' ') || 'GTNI'}
                   </span> */}
            </div>

            {/* Title with Gradient Effect */}
            {data.heroTitle && (
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-6">
                <span className="inline-block">{data.heroTitle}</span>
              </h1>
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
         SECTION 1.5: VIDEO & CALL TO ACTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 pt-20">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-4xl shadow-2xl flex flex-col lg:flex-row items-center gap-12"
          >
            {/* Left Column: Text & Button */}
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left gap-8">
              <h3 className="text-xl md:text-3xl font-bold text-brand-dark leading-relaxed">
                {data.heroDescription}
              </h3>

              {data.applyButtonLink && (
                <a
                  href={data.applyButtonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-300 bg-brand-turquoise rounded-full hover:bg-brand-dark hover:scale-105 shadow-[0_0_20px_-5px_rgba(45,212,191,0.5)]"
                >
                  {/* Assuming 'Apply' text or data.applyButtonText */}
                  Apply
                </a>
              )}
            </div>

            {/* Right Column: Video */}
            <div className="w-full lg:w-1/2">
              {data.videoUrl && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  {/* Check if it's a YouTube URL to embed properly, otherwise simple video tag or link */}
                  {data.videoUrl.includes('youtube') || data.videoUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={(() => {
                        const ytMatch = data.videoUrl.match(
                          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/,
                        )
                        return ytMatch
                          ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`
                          : data.videoUrl
                      })()}
                      title="Admission Process Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  ) : (
                    <video controls className="w-full h-full object-cover">
                      <source src={data.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-20 py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8">
            {/* Top: Qualifications (Light Card) */}
            <motion.div
              {...fadeInUp}
              className="w-full bg-white/95 backdrop-blur-xl p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden"
            >
              {/* Decorative Blob */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-turquoise/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-brand-turquoise/10 rounded-2xl text-brand-turquoise">
                    <GraduationCap size={32} />
                  </div>
                  <h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-brand-dark tracking-tight">
                    {data.qualificationsTitle}
                  </h2>
                </div>
                <div className="prose prose-lg text-gray-600 prose-headings:text-brand-dark prose-p:leading-relaxed prose-strong:text-brand-turquoise max-w-none">
                  {data.qualificationsContent && <RichText content={data.qualificationsContent} />}
                </div>
              </div>
            </motion.div>

            {/* Bottom: Decision Aspects (Dark "Floating" Card) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <div className="bg-brand-dark text-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 group hover:border-brand-turquoise/30 transition-colors">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-brand-turquoise/10 to-transparent pointer-events-none" />

                <h3 className="lg:text-3xl md:text-2xl text-xl font-bold text-white mb-8 border-l-4 border-brand-turquoise pl-4 flex items-center gap-3">
                  {data.admissionDecisionTitle}
                </h3>

                <ul className="space-y-6 relative z-10">
                  {data.admissionDecisionAspects?.map((item, i) => (
                    <li key={i} className="flex flex-col lg:flex-row gap-4 items-start group/item">
                      <span className="shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-brand-turquoise flex items-center justify-center font-bold text-lg group-hover/item:bg-brand-turquoise group-hover/item:text-brand-dark transition-all duration-300">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 group-hover/item:text-white transition-colors pt-2 text-lg">
                        {item.aspect}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 3: REQUIREMENTS & SUBMISSION (Premium Dark Mode)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-brand-dark text-white overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [bg-size:32px_32px]" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid xl:grid-cols-2 gap-10">
            {/* --- Requirements Column --- */}
            <div className="flex flex-col gap-12">
              <motion.div {...fadeInUp}>
                <h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-turquoise to-teal-200 mb-4">
                  {data.requirementsTitle}
                </h2>
                <div className="h-1 w-32 bg-brand-turquoise rounded-full mb-8" />
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid gap-4"
              >
                {data.requirementsList?.map((req, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex gap-4 items-start p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-turquoise/30 transition-all duration-300"
                  >
                    <CheckCircle2 className="shrink-0 text-brand-turquoise mt-1" size={24} />
                    <span className="text-lg text-gray-200">{req.requirement}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Intro Info Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-brand-turquoise/10 p-8 rounded-3xl border border-brand-turquoise/20 mt-8"
              >
                <div className="prose prose-invert prose-lg">
                  {data.introInfo && <RichText content={data.introInfo} />}
                </div>
              </motion.div>
            </div>

            {/* --- Submission & Steps Column --- */}
            <div className="flex flex-col gap-12">
              {/* Submission Documents */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <FileCheck className="text-brand-turquoise" size={28} />
                  </div>
                  <h3 className="lg:text-3xl md:text-2xl text-xl font-bold">
                    {data.submissionTitle}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {data.submissionList?.map((item, i) => (
                    <div
                      key={i}
                      className="group p-5 bg-white/5 rounded-xl border border-white/5 hover:bg-brand-turquoise hover:text-brand-dark transition-all duration-300 cursor-default"
                    >
                      <p className="font-medium">{item.document}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Application Steps */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <ListChecks className="text-brand-turquoise" size={28} />
                  </div>
                  <h3 className="lg:text-3xl md:text-2xl text-xl font-bold">
                    {data.applicationStepsTitle}
                  </h3>
                </div>

                <div className="relative border-l-2 border-white/10 ml-4 space-y-10">
                  {data.applicationStepsList?.map((step, i) => (
                    <div key={i} className="relative pl-10 group">
                      {/* Timeline Dot */}
                      <span className="absolute left-[-1.35rem] top-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-dark border-4 border-white/10 text-brand-turquoise font-bold text-sm group-hover:border-brand-turquoise group-hover:bg-brand-turquoise group-hover:text-brand-dark transition-all duration-300 shadow-xl">
                        {i + 1}
                      </span>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300">
                        <p className="text-gray-300 text-lg">{step.step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 3.5: APPLICATION STEPS VISUALS
      ════════════════════════════════════════════════════════════════════════ */}
      {(() => {
        const desktopUrl =
          data.stepsImageDesktop &&
          typeof data.stepsImageDesktop === 'object' &&
          'url' in data.stepsImageDesktop
            ? data.stepsImageDesktop.url
            : null
        const desktopWidth =
          data.stepsImageDesktop &&
          typeof data.stepsImageDesktop === 'object' &&
          'width' in data.stepsImageDesktop
            ? data.stepsImageDesktop.width
            : 1920
        const desktopHeight =
          data.stepsImageDesktop &&
          typeof data.stepsImageDesktop === 'object' &&
          'height' in data.stepsImageDesktop
            ? data.stepsImageDesktop.height
            : 1080

        const mobileUrl =
          data.stepsImageMobile &&
          typeof data.stepsImageMobile === 'object' &&
          'url' in data.stepsImageMobile
            ? data.stepsImageMobile.url
            : null
        const mobileWidth =
          data.stepsImageMobile &&
          typeof data.stepsImageMobile === 'object' &&
          'width' in data.stepsImageMobile
            ? data.stepsImageMobile.width
            : 1080
        const mobileHeight =
          data.stepsImageMobile &&
          typeof data.stepsImageMobile === 'object' &&
          'height' in data.stepsImageMobile
            ? data.stepsImageMobile.height
            : 1920

        const desktopAlt =
          data.stepsImageDesktop &&
          typeof data.stepsImageDesktop === 'object' &&
          'alt' in data.stepsImageDesktop
            ? data.stepsImageDesktop.alt
            : 'Application Steps Desktop'
        const mobileAlt =
          data.stepsImageMobile &&
          typeof data.stepsImageMobile === 'object' &&
          'alt' in data.stepsImageMobile
            ? data.stepsImageMobile.alt
            : 'Application Steps Mobile'

        if (!desktopUrl && !mobileUrl) return null

        const desktopW = desktopWidth || 1920
        const desktopH = desktopHeight || 1080
        const mobileW = mobileWidth || 1080
        const mobileH = mobileHeight || 1920

        return (
          <section className="py-24 bg-white overflow-hidden border-b border-gray-100">
            <div className="container mx-auto max-w-7xl px-4">
              {data.stepsTitle && (
                <div className="text-center mb-12">
                  <motion.h2
                    {...fadeInUp}
                    className="lg:text-3xl md:text-2xl text-xl font-bold text-brand-dark"
                  >
                    {data.stepsTitle}
                  </motion.h2>
                  <motion.div
                    {...fadeInUp}
                    className="w-24 h-1.5 bg-linear-to-r from-brand-turquoise to-brand-primary rounded-full mx-auto mt-4"
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto flex justify-center"
              >
                {desktopUrl && mobileUrl ? (
                  <>
                    {/* Desktop Image */}
                    <div
                      className="hidden md:block w-full relative group cursor-zoom-in"
                      onClick={() => setActiveImage(desktopUrl)}
                    >
                      <Image
                        src={desktopUrl}
                        alt={desktopAlt || 'Application Steps'}
                        width={desktopW}
                        height={desktopH}
                        className="w-full h-auto rounded-3xl shadow-xl border border-gray-100 transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl">
                        <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-brand-dark font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm">
                          <svg
                            className="w-5 h-5 text-brand-turquoise"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                            />
                          </svg>
                          <span>Click to expand</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Image */}
                    <div
                      className="block md:hidden w-full relative group cursor-zoom-in"
                      onClick={() => setActiveImage(mobileUrl)}
                    >
                      <Image
                        src={mobileUrl}
                        alt={mobileAlt || 'Application Steps'}
                        width={mobileW}
                        height={mobileH}
                        className="w-full h-auto rounded-3xl shadow-xl border border-gray-100 transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl">
                        <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-brand-dark font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm">
                          <svg
                            className="w-5 h-5 text-brand-turquoise"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                            />
                          </svg>
                          <span>Click to expand</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Only one image is provided (either desktop or mobile) */
                  <div
                    className="w-full relative group cursor-zoom-in"
                    onClick={() => setActiveImage((desktopUrl || mobileUrl)!)}
                  >
                    <Image
                      src={(desktopUrl || mobileUrl)!}
                      alt={(desktopUrl ? desktopAlt : mobileAlt) || 'Application Steps'}
                      width={desktopUrl ? desktopW : mobileW}
                      height={desktopUrl ? desktopH : mobileH}
                      className="w-full h-auto rounded-3xl shadow-xl border border-gray-100 transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl">
                      <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-brand-dark font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm">
                        <svg
                          className="w-5 h-5 text-brand-turquoise"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                          />
                        </svg>
                        <span>Click to expand</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )
      })()}

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 4: PROFESSIONAL DOMAINS (Visual Side-by-Side Top, List Below)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Top Part: Title & Image Side-by-Side */}
          <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
            {/* Content Side (Title) */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 order-2 lg:order-1">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-4 mb-4">
                  <Target className="text-brand-turquoise" size={40} />
                  <span className="text-brand-turquoise font-bold tracking-wider ">
                    Professional Standards
                  </span>
                </div>
                <h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-brand-dark leading-[1.1]">
                  {data.domainsTitle}
                </h2>
              </motion.div>
            </div>

            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotate: 3 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="w-full lg:w-1/2 order-1 lg:order-2"
            >
              {data.domainsImage &&
                typeof data.domainsImage === 'object' &&
                'url' in data.domainsImage && (
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-video group">
                    <Image
                      src={data.domainsImage.url || ''}
                      alt={data.domainsImage.alt || 'Professional Domains'}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay Text */}
                    {data.domainsImageTitle && (
                      <div className="absolute bottom-0 left-0 w-full p-8 bg-linear-to-t from-black/80 to-transparent">
                        <p className="text-white/80 font-medium tracking-widest  text-sm">
                          {data.domainsImageTitle}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </motion.div>
          </div>

          {/* Bottom Part: Domains List Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {data.domainsList?.map((domain, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="group cursor-default bg-white p-8 rounded-3xl transition-all duration-300 border border-transparent hover:border-brand-turquoise/20 hover:shadow-xl hover:bg-brand-turquoise/5"
              >
                <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4 group-hover:text-brand-turquoise transition-colors flex items-start justify-between gap-4">
                  <span>{domain.domainTitle}</span>
                  <ScrollText className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-turquoise shrink-0 mt-1" />
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">{domain.domainDescription}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-[95vw] h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage}
                alt="Expanded steps diagram"
                fill
                sizes="95vw"
                priority
                className="object-contain rounded-lg"
              />
            </motion.div>
            <button
              className="absolute top-6 right-6 text-white hover:text-brand-turquoise text-5xl font-light focus:outline-none transition-colors z-50 p-4 cursor-pointer"
              onClick={() => setActiveImage(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
