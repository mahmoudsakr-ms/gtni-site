'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react'

import { Footer } from '@/payload-types'
import { SmartText } from './SmartText'
import { sanitizeUrl } from '@/utilities/sanitizeUrl'

interface FooterProps {
  data: Footer
}

const socialIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
}

export const FooterClient = ({ data }: FooterProps) => {
  return (
    <footer className="relative bg-brand-dark text-white pt-32 pb-12 overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-brand-turquoise/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-brand-turquoise/5 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-[30vw] h-[30vw] bg-white/2 blur-[120px] rounded-full" />

        {/* Animated Grid Line */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Identity Section */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-block notranslate">
                {data.logo &&
                typeof data.logo === 'object' &&
                'url' in data.logo &&
                data.logo.url ? (
                  <Image
                    src={data.logo.url}
                    alt={data.logo.alt || 'GTNI Logo'}
                    width={180}
                    height={60}
                    className="brightness-0 invert h-auto w-auto max-h-16 object-contain"
                  />
                ) : (
                  <span className="text-3xl font-black notranslate">
                    GTNI<span className="text-brand-turquoise">.</span>
                  </span>
                )}
              </Link>
            </motion.div>

            <div className="space-y-4 max-w-lg">
              <p className="text-white/60 leading-relaxed"><SmartText text={data.description || ''} /></p>

              <div className="flex items-center gap-3 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                <span><SmartText text="Educating" /></span>
                <span className="w-1 h-1 rounded-full bg-brand-turquoise/60" />
                <span><SmartText text="Inspiring" /></span>
                <span className="w-1 h-1 rounded-full bg-brand-turquoise/60" />
                <span><SmartText text="Enableing" /></span>
              </div>
            </div>

            <div className="flex gap-4">
              {data.socialLinks?.map((social, idx) => {
                const Icon = socialIcons[social.platform || '']
                return (
                  <motion.a
                    key={idx}
                    href={sanitizeUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -5, rotate: 8 }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-turquoise hover:border-brand-turquoise/50 hover:bg-brand-turquoise/10 transition-all duration-300 shadow-lg shadow-black/20"
                  >
                    {Icon && <Icon size={20} />}
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick Navigation Section */}
          <div className="space-y-8">
            <h4 className="text-lg font-bold uppercase tracking-widest text-brand-turquoise flex items-center gap-3">
              <span className="w-8 h-px bg-brand-turquoise/30" />
              Links
            </h4>
            <ul className="space-y-4">
              {data.quickLinks?.map((item, idx) => {
                const slug = item.globalPage
                const href = `/${slug || ''}`

                return (
                  <li key={idx}>
                    <Link
                      href={href}
                      className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-300"
                    >
                      <motion.span className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-brand-turquoise">
                        <ArrowRight size={14} />
                      </motion.span>
                      <span className="font-medium"><SmartText text={item.label} /></span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Information Pulse Section */}
          <div className="space-y-8">
            <h4 className="text-lg font-bold uppercase tracking-widest text-brand-turquoise flex items-center gap-3">
              <span className="w-8 h-px bg-brand-turquoise/30" />
              Contact
            </h4>
            <ul className="space-y-6">
              {[
                { icon: MapPin, text: data.contactInfo?.address, noTranslate: false },
                { icon: Phone, text: data.contactInfo?.phone, noTranslate: true },
                { icon: Mail, text: data.contactInfo?.email, noTranslate: true },
              ].map(
                (item, idx) =>
                  item.text && (
                    <li key={idx} className="flex gap-4 items-start text-white/50 group">
                      <div className="mt-1 w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-turquoise/50 group-hover:text-brand-turquoise transition-colors">
                        <item.icon size={18} />
                      </div>
                      <span className={`leading-relaxed group-hover:text-white transition-colors${item.noTranslate ? ' notranslate' : ''}`}>
                        {item.text}
                      </span>
                    </li>
                  ),
              )}
            </ul>
          </div>

          {/* Immersive Newsletter/CTA Section */}
          <div className="space-y-8">
            <div className="relative p-8 rounded-3xl bg-linear-to-br from-brand-turquoise/20 to-brand-turquoise/5 border border-brand-turquoise/20 overflow-hidden group">
              <div className="relative z-10">
                <h5 className="text-xl font-bold mb-2">Ready to Start?</h5>
                <p className="text-white/60 text-sm mb-6">
                  Join thousands of students shaping their future today.
                </p>
                <Link
                  href="/admission"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-brand-turquoise text-brand-dark font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white hover:scale-105 transition-all duration-500 shadow-xl shadow-brand-turquoise/20"
                >
                  Apply Now
                  <ArrowRight size={16} />
                </Link>
              </div>
              {/* Animated Background Blob */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-turquoise blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* Closing Masterpiece (Copyright Area) */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-sm font-medium tracking-wide notranslate">
            {`powered by xtreme-communication © ${new Date().getFullYear()}`}
          </p>
        </div>
      </div>
    </footer>
  )
}
