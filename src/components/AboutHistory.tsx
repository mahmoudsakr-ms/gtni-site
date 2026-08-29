'use client'

import React from 'react'
import { motion } from 'framer-motion'
import RichText from '@/components/RichText'
import { History } from 'lucide-react'
import { NodeTypes } from '@/components/RichText/serialize'

interface AboutHistoryProps {
  content?: {
    root: {
      children: NodeTypes[]
    }
  } | null
}

const AboutHistory: React.FC<AboutHistoryProps> = ({ content }) => {
  if (!content) return null
  return (
    <section className="relative py-32 bg-[#fafafa] overflow-hidden">
      {/* Decorative Archive Elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-[0.02] rotate-90 pointer-events-none select-none">
        <span className="text-[200px] font-black   text-brand-dark">ARCHIVE</span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Sidebar Labeling */}
            <div className="lg:w-1/4">
              <div className="sticky top-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-px bg-brand-turquoise" />
                  <span className="text-brand-turquoise text-xs font-bold uppercase tracking-[0.4em]">
                    Established 2010
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-brand-dark leading-none   mb-10">
                  Our
                  <br />
                  History
                </h2>
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm transition-colors hover:text-brand-turquoise hover:border-brand-turquoise/30">
                  <History size={24} />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-3/4">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative"
              >
                {/* Vertical Timeline Thread */}
                <div className="absolute -left-10 top-0 bottom-0 w-[2px] bg-linear-to-b from-brand-turquoise to-transparent hidden md:block" />

                <div className="prose prose-2xl prose-p:text-zinc-600 prose-p:leading-[1.6] prose-headings:text-brand-dark prose-strong:text-brand-turquoise max-w-none">
                  <RichText content={content} />
                </div>

                {/* Closing Signature Element */}
                <div className="mt-20 pt-10 border-t border-zinc-200 flex justify-between items-end">
                  <div>
                    <p className="text-zinc-400 text-sm italic">A legacy of nursing excellence</p>
                    <p className="text-brand-dark font-black   mt-1 text-2xl uppercase">
                      Building the Future
                    </p>
                  </div>
                  <div className="w-20 h-[1px] bg-zinc-300" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutHistory
