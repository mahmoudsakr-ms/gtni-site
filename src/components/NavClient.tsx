'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Lock, Globe, Loader2 } from 'lucide-react'

import { Media } from '@/payload-types'
import { useLanguage } from './GoogleTranslate'
import { SmartText } from './SmartText'

interface NavClientProps {
  navItems: {
    label: string
    link: string
    globalPage?: string
  }[]
  loginLinks: {
    label: string
    link: string
  }[]
  logo?: Media | null
}

export const NavClient = ({ navItems, loginLinks, logo }: NavClientProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLoginDropdown, setShowLoginDropdown] = useState(false)
  const pathname = usePathname()
  const { isArabic, isTranslating, toggleLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        scrolled ? 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2' : 'bg-white/95 py-3'
      }`}
    >
      {/* Visual Background Element (Right Side Angled Image) */}
      <div className="absolute top-0 right-0 h-full w-[50%] md:w-[45%] lg:w-[40%] z-0 pointer-events-none overflow-hidden hidden sm:block">
        <Image
          src="/images/gtni-bg-2.png"
          alt="Premium Background"
          fill
          sizes="(max-width: 640px) 0vw, (max-width: 1024px) 50vw, 40vw"
          className="object-cover object-right"
          priority
        />
        {/* Subtle overlay to blend the image better if needed */}
        <div className="absolute inset-0 bg-linear-to-l from-transparent to-white/10"></div>
      </div>

      <div className="container mx-auto max-w-[1380px] px-6 relative z-10">
        <div className="flex items-center justify-between gap-1 xl:gap-2 2xl:gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 notranslate">
            <div className="relative h-16 transition-transform hover:scale-105 flex items-center justify-start">
              {logo?.url && (
                <Image
                  src={logo.url}
                  alt={logo.alt || 'GTNI Logo'}
                  width={200}
                  height={80}
                  className="h-10 lg:h-11 xl:h-11 2xl:h-14 w-auto object-contain object-left"
                />
              )}
            </div>
          </Link>
 
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5 lg:space-x-1.5 xl:space-x-2 2xl:space-x-3 bg-white/10 backdrop-blur-md px-2.5 xl:px-4 2xl:px-6 py-1.5 2xl:py-2 rounded-full border border-white/20 shadow-sm transition-all duration-300">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/${item.globalPage || ''}`}
                  className={`px-1 lg:px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-[12px] lg:text-[13px] xl:text-[13.5px] 2xl:text-[14px] font-bold transition-colors relative group whitespace-nowrap ${
                    pathname === `/${item.globalPage || ''}`
                      ? 'text-brand-turquoise'
                      : 'text-brand-dark hover:text-brand-turquoise'
                  }`}
                >
                  <SmartText text={item.label} />
                  <span
                    className={`absolute bottom-0 left-1 lg:left-2 xl:left-2.5 2xl:left-3 right-1 lg:right-2 xl:right-2.5 2xl:right-3 h-0.5 bg-brand-turquoise transition-transform duration-300 origin-left ${
                      pathname === `/${item.globalPage || ''}`
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  ></span>
                </Link>
              </motion.div>
            ))}
          </div>
 
          {/* Anniversary Logo & Language Toggle & Login Dropdown & Action Area */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2 relative">
            {/* 15 Year Anniversary Logo */}
            <div className="relative h-10 w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12 2xl:h-16 2xl:w-16 transition-transform hover:scale-110">
              <Image
                src="/GTNI-logo-15yer.png"
                alt="GTNI 15 Years Anniversary"
                className="object-contain"
                fill
                sizes="(max-width: 1280px) 40px, (max-width: 1536px) 48px, 64px"
              />
            </div>
 
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              className={`notranslate flex items-center gap-1 xl:gap-1.5 2xl:gap-2 px-2 xl:px-2.5 2xl:px-3 py-2 2xl:py-2.5 border border-brand-turquoise/40 rounded-full font-bold text-xs 2xl:text-sm transition-all duration-300 shadow-sm ${
                isTranslating
                  ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-white/80 text-brand-dark hover:bg-brand-turquoise/10 hover:border-brand-turquoise'
              }`}
              aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {isTranslating ? (
                <Loader2 size={14} className="text-brand-turquoise animate-spin" />
              ) : (
                <Globe size={14} className="text-brand-turquoise" />
              )}
              <span>{isTranslating ? '...' : (isArabic ? 'EN' : 'AR')}</span>
            </button>
 
            <div
              className="relative"
              onMouseEnter={() => setShowLoginDropdown(true)}
              onMouseLeave={() => setShowLoginDropdown(false)}
            >
              <button
                className={`flex items-center gap-1 xl:gap-1.5 2xl:gap-2 px-2 xl:px-2.5 2xl:px-4 py-2 2xl:py-2.5 border border-brand-turquoise rounded-full font-bold text-xs 2xl:text-sm transition-all duration-300 ${
                  showLoginDropdown
                    ? 'bg-brand-turquoise text-brand-dark'
                    : 'bg-brand-dark text-white hover:bg-brand-turquoise hover:text-brand-dark'
                } shadow-lg shadow-black/10`}
              >
                <Lock size={14} />
                <span className="notranslate">LOGIN</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    showLoginDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showLoginDropdown && loginLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute top-full right-0 mt-1 w-52 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] py-2 overflow-hidden z-20"
                  >
                    <div className="px-1.5">
                      {loginLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.link}
                          target="_blank"
                          className="flex items-center px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-brand-turquoise/10 rounded-xl transition-all group relative overflow-hidden"
                        >
                          <span className="group-hover:text-brand-turquoise transition-colors duration-300 truncate">
                            {link.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-brand-dark focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[calc(100vh-80px)]"
          >
            {/* Anniversary Logo (Mobile) */}
            <div className="flex justify-start px-5 pt-4">
              <div className="relative h-16 w-16">
                <Image
                  src="/GTNI-logo-15yer.png"
                  alt="GTNI 15 Years Anniversary"
                  className="object-contain"
                  fill
                  sizes="64px"
                />
              </div>
            </div>
            <div className="flex flex-col p-6 space-y-6">
              {/* Main Links */}
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/${item.globalPage || ''}`}
                      className={`text-lg font-bold block transition-colors ${
                        pathname === `/${item.globalPage || ''}`
                          ? 'text-brand-turquoise'
                          : 'text-brand-dark hover:text-brand-turquoise'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <SmartText text={item.label} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Language Toggle (Mobile) */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => { toggleLanguage(); if (!isTranslating) setIsOpen(false); }}
                  disabled={isTranslating}
                  className={`notranslate flex items-center justify-center gap-3 w-full p-4 rounded-2xl border border-brand-turquoise/30 font-bold transition-all ${
                    isTranslating
                      ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-brand-turquoise/10 text-brand-dark hover:bg-brand-turquoise/20'
                  }`}
                  aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                  {isTranslating ? (
                    <Loader2 size={20} className="text-brand-turquoise animate-spin" />
                  ) : (
                    <Globe size={20} className="text-brand-turquoise" />
                  )}
                  <span>{isTranslating ? (isArabic ? 'Switching...' : 'جاري الترجمة...') : (isArabic ? 'English' : 'العربية')}</span>
                </button>
              </div>

              {/* Login Links Sector */}
              {loginLinks.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-brand-dark text-white font-bold mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={18} />
                      <span className="notranslate">LOGIN</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        showLoginDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showLoginDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-2 pb-2">
                          {loginLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.link}
                              target="_blank"
                              className="flex items-center p-4 rounded-xl bg-gray-50 font-bold text-brand-dark hover:bg-brand-turquoise/10 transition-all text-sm"
                              onClick={() => setIsOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
