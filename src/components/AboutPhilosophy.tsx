'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ArrowRight } from 'lucide-react'
import RichText from '@/components/RichText'
import { SmartText } from '@/components/SmartText'

import type { AboutGtni, Media } from '@/payload-types'

interface AboutPhilosophyProps {
  title?: string | null
  content?: AboutGtni['philosophyContent']
  image?: Media | null
}

export const AboutPhilosophy = ({ title, content, image }: AboutPhilosophyProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="relative py-24 bg-linear-to-br from-brand-dark to-brand-turquoise overflow-hidden">
      <div className="container mx-auto max-sm:px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Text Side - Elegant Typography */}
          <div className="space-y-10 order-2 lg:order-1">
            <header>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:text-3xl md:text-2xl font-black text-white leading-[0.95]"
              >
                {title || 'Philosophy'}
              </motion.h2>
            </header>

            <div className="relative group">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="prose prose-xl max-w-none text-white font-medium leading-relaxed max-h-[500px] overflow-hidden relative"
              >
                {content && <RichText content={content} />}
                {/* Fade effect at the bottom */}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                onClick={() => setIsModalOpen(true)}
                className="mt-4 flex items-center gap-2  py-1  hover:text-white font-black uppercase tracking-widest rounded-2xl  text-brand-turquoise transition-all cursor-pointer"
              >
                Read Full Philosophy
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </motion.div>
            </div>

            {/* Decorative Turquoise Line with Dot */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-16 h-1 bg-brand-turquoise rounded-full" />
              <div className="w-2 h-2 bg-brand-turquoise rounded-full" />
              <div className="flex-1 h-px bg-zinc-100/20" />
            </div>
          </div>

          {/* Media Side - World Class Depth */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-4/5 rounded-[3rem] overflow-hidden shadow-2xl group">
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.alt || 'Philosophy Image'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise/10 to-brand-dark/5 flex items-center justify-center">
                  <div className="text-brand-turquoise/20 font-black text-6xl uppercase tracking-[0.2em] transform -rotate-12">
                    GTNI Concept
                  </div>
                </div>
              )}
              {/* Overlay Glassmorphism Accent */}
              <div className="absolute bottom-8 left-8 right-8 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                {/* <div className="text-white text-xs font-medium uppercase tracking-[0.4em] mb-2 opacity-60">
                  “Nursing is not only learned—it is lived, shaped, and carried with purpose.”
                </div> */}
                <div className="text-white text-xl font-semibold text-shadow-xs text-shadow-black">
                  <SmartText text="Nursing is not only learned—it is lived, shaped, and carried with purpose." />
                </div>
              </div>
            </div>

            {/* Decorative Floating Element */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 -left-10 w-32 h-32 bg-brand-turquoise/10 blur-[50px] rounded-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Philosophy Full View Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-brand-dark/95 backdrop-blur-2xl"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 md:p-12 border-b border-gray-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-2xl md:text-3xl font-black text-brand-dark">
                  {title || 'Philosophy'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-brand-dark/5 hover:bg-brand-dark hover:text-white text-brand-dark rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 md:p-12 custom-scrollbar">
                <div className="prose prose-xl  prose-brand max-w-none text-brand-dark">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {content && <RichText content={content as any} />}
                </div>
              </div>

              {/* Modal Footer Decorative */}
              <div className="p-8 bg-zinc-50 border-t border-gray-100 flex justify-end">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-1 bg-brand-turquoise rounded-full" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
                    GTNI Concept
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
