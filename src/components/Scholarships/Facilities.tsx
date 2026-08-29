'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2, School, Library, Utensils, Bus, Home, Stethoscope, HelpCircle, Compass } from 'lucide-react'
import RichText from '@/components/RichText'

import { Scholarship } from '@/payload-types'

interface FacilitiesProps {
  facilitiesSections: Scholarship['facilitiesSections']
}

const Facilities: React.FC<FacilitiesProps> = ({ facilitiesSections }) => {
  const getIconForCategory = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('teaching') || t.includes('learning'))
      return <School className="text-brand-turquoise" />
    if (t.includes('library') || t.includes('resource'))
      return <Library className="text-brand-turquoise" />
    if (t.includes('food') || t.includes('cafe') || t.includes('meal'))
      return <Utensils className="text-brand-turquoise" />
    if (t.includes('transport')) return <Bus className="text-brand-turquoise" />
    if (t.includes('housing') || t.includes('accommodation'))
      return <Home className="text-brand-turquoise" />
    if (t.includes('clinical') || t.includes('experience'))
      return <Stethoscope className="text-brand-turquoise" />
    if (t.includes('why'))
      return <HelpCircle className="text-brand-turquoise" />
    if (t.includes('begin') || t.includes('journey'))
      return <Compass className="text-brand-turquoise" />
    return <CheckCircle2 className="text-brand-turquoise" />
  }

  return (
    <section className="pb-24 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="space-y-32">
          {facilitiesSections?.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`grid grid-cols-1 lg:grid-cols-6 gap-12 items-center ${
                index % 2 !== 0 ? 'lg:direction-rtl' : ''
              }`}
            >
              {/* Image Partition */}
              <div
                className={`lg:col-span-12 xl:col-span-10 xl:col-start-${index % 2 === 0 ? '1' : '3'} flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
              >
                <div className="w-full lg:w-1/2 relative group">
                  <div className="absolute -inset-4 bg-brand-turquoise/5 rounded-3xl blur-2xl group-hover:bg-brand-turquoise/10 transition-all duration-500" />
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                    {section.mainImage &&
                      typeof section.mainImage === 'object' &&
                      'url' in section.mainImage &&
                      section.mainImage.url && (
                        <Image
                          src={section.mainImage.url}
                          alt={section.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                    <div className="absolute inset-0 bg-linear-to-t from-brand-dark/20 to-transparent" />
                  </div>


                </div>

                {/* Content Partition */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-turquoise/5 border border-brand-turquoise/10">
                    {getIconForCategory(section.title)}
                  </div>

                  <h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-brand-dark">
                    {section.title}
                  </h2>

                  <div className="prose prose-lg text-gray-600 leading-relaxed marker:text-brand-turquoise">
                    {section.description && <RichText content={section.description} />}
                  </div>

                  {/* Decorative List Hint */}
                  <div className="pt-4 flex flex-wrap gap-4">
                    {/* Gallery removed as it is not part of the schema */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Facilities
