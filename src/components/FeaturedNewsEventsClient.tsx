'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { NewsEventsGlobal, NewsCategory } from '@/payload-types'
import type { NewsEventWithResolvedThumbnail } from '@/utilities/video'

type NewsItem = NewsEventWithResolvedThumbnail

const getEmbedUrl = (url: string) => {
  if (!url) return ''
  
  // YouTube detection (handles watch, embed, shorts, youtu.be)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  if (url.includes('stream.aspx')) {
    return url.replace('stream.aspx', 'embed.aspx')
  }
  return url
}

const VideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}: {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}) => {
  const isLocalVideo = !videoUrl.includes('youtube.com') && 
                       !videoUrl.includes('youtu.be') && 
                       !videoUrl.includes('vimeo.com') && 
                       (videoUrl.endsWith('.mp4') || videoUrl.includes('.mp4') || videoUrl.includes('/media/'))

  const getAbsoluteVideoUrl = (url: string) => {
    if (!url) return ''
    if (!url.startsWith('http') && !url.startsWith('/') && url.toLowerCase().endsWith('.mp4')) {
      return `/media/${url}`
    }
    return url
  }

  const isShort = videoUrl.includes('/shorts/') || videoUrl.includes('shorts')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4 max-sm:p-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close button outside the video frame to prevent overlapping with YouTube UI */}
          <div className={`w-full ${isShort ? 'max-w-md' : 'max-w-5xl'} flex justify-end mb-2 max-sm:px-4 max-sm:mt-4`}>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full ${isShort ? 'max-w-md aspect-[9/16] max-h-[80vh]' : 'max-w-5xl sm:aspect-video aspect-[4/3]'} bg-zinc-900 sm:rounded-3xl rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
            onClick={(e) => e.stopPropagation()}
          >
            {isLocalVideo ? (
              <video
                src={getAbsoluteVideoUrl(videoUrl)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={`${getEmbedUrl(videoUrl)}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface HomepageCategory {
  id: string | number
  name: string
  slug: string
  showAllButtonText?: string
  subCategoryIds: (string | number)[]
}

export const FeaturedNewsEventsClient = ({
  items,
  categoriesData = [],
  hero,
}: {
  items: NewsItem[]
  categoriesData?: HomepageCategory[]
  hero?: NewsEventsGlobal['hero']
}) => {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [activeTab, setActiveTab] = useState(() => {
    return categoriesData?.[0]?.slug || 'all'
  })
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get unique categories from items if categoriesData is not provided
  const tabsList = categoriesData?.length
    ? categoriesData.map((c) => ({ name: c.name, slug: c.slug }))
    : [
        { name: 'All', slug: 'all' },
        ...Array.from(
          new Set(
            items.map((item) => {
              const cat = item.itemCategory
              if (cat && typeof cat === 'object' && 'name' in cat) {
                return (cat as NewsCategory).name || 'general'
              }
              return 'general'
            }),
          ),
        ).map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
      ]

  // Filter items based on active tab and limit to 6 items
  const filteredItems = items
    .filter((item) => {
      if (activeTab === 'all') return true

      const activeCatDoc = categoriesData.find((c) => c.slug === activeTab)
      const itemCat = item.itemCategory
      const itemCatId = itemCat && typeof itemCat === 'object' ? itemCat.id : itemCat

      if (activeCatDoc) {
        return itemCatId === activeCatDoc.id || activeCatDoc.subCategoryIds.includes(itemCatId)
      }

      const itemCatName =
        itemCat && typeof itemCat === 'object' && 'name' in itemCat
          ? (itemCat as NewsCategory).name
          : 'general'
      const itemCatSlug = itemCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return itemCatSlug === activeTab
    })
    .slice(0, 6)

  const activeTabName = tabsList.find((t) => t.slug === activeTab)?.name || 'News'

  // Ensure currentIndex is always within bounds
  const currentItem = filteredItems[currentIndex] || filteredItems[0]

  // Reset index when tab changes
  React.useEffect(() => {
    setCurrentIndex(0)
  }, [activeTab])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  // Touch swiping navigation logic
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  if (items.length === 0) return null

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background Ambience / Lighting Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand-turquoise/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-turquoise/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        {/* Centered Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {hero?.subtitle && (
              <h2 className="lg:text-3xl md:text-2xl font-bold max-w-2xl mx-auto text-brand-dark mb-6">
                {hero.subtitle}
              </h2>
            )}
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:justify-start justify-center gap-2 md:gap-4 mb-12 pb-2 scrollbar-none w-full"
          >
            {tabsList.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => setActiveTab(tab.slug)}
                className={`relative px-8 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shrink-0 cursor-pointer ${
                  activeTab === tab.slug
                    ? 'text-white bg-brand-turquoise'
                    : 'text-brand-dark/50 hover:text-brand-turquoise/80 hover:bg-brand-turquoise/10'
                }`}
              >
                {tab.name}
                {activeTab === tab.slug && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-turquoise/70 rounded-2xl -z-1"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Improved Slider Section */}
        <div className="relative max-w-5xl mx-auto">
          {filteredItems.length > 0 ? (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Media Section (Video/Image) */}
                  <div
                    className="md:col-span-8 group relative sm:rounded-[2.5rem] rounded-3xl overflow-hidden bg-white shadow-2xl shadow-brand-turquoise/10 cursor-pointer"
                    onClick={() =>
                      currentItem.type === 'video' &&
                      setSelectedVideo({
                        url: currentItem.videoUrl || '',
                        title: currentItem.title,
                      })
                    }
                  >
                    <div className="absolute -inset-px bg-linear-to-tr from-brand-turquoise/40 via-brand-dark/5 to-transparent rounded-[2.5rem] opacity-30 group-hover:opacity-100 transition-opacity" />

                    <div className="relative sm:aspect-video aspect-[4/3] overflow-hidden">
                      {currentItem.resolvedThumbnailUrl ? (
                        <div className="absolute inset-0 bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentItem.resolvedThumbnailUrl}
                            alt={currentItem.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-brand-turquoise/10 via-zinc-100 to-white" />
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                      {currentItem.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                            <div className="absolute inset-0 bg-brand-turquoise/30 rounded-full blur-2xl group-hover:bg-brand-turquoise/50 transition-colors" />
                            <div className="relative w-full h-full bg-white text-brand-dark rounded-full flex items-center justify-center shadow-2xl group-hover:bg-brand-turquoise transition-colors">
                              <Play fill="currentColor" size={20} className="ml-1" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section (Beside Video) */}
                  <div className="md:col-span-4 space-y-6 md:pl-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-brand-turquoise/10 text-brand-turquoise text-[10px] font-black uppercase tracking-widest border border-brand-turquoise/20">
                        {currentItem.type}
                      </span>
                      <span className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-widest">
                        {new Date(currentItem.publishedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-brand-dark leading-tight">
                      {currentItem.title}
                    </h3>

                    <p className="text-brand-dark/60 text-lg leading-relaxed line-clamp-3">
                      {currentItem.excerpt}
                    </p>

                    <Link
                      href={`/news-events#${activeTab}`}
                      className="inline-flex items-center gap-3 text-brand-turquoise font-bold uppercase tracking-widest text-sm group/link"
                    >
                      {categoriesData.find((c) => c.slug === activeTab)?.showAllButtonText || `Show All ${activeTabName}`}
                      <ArrowRight
                        size={18}
                        className="translate-x-0 group-hover/link:translate-x-2 transition-transform"
                      />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              {filteredItems.length > 1 && (
                <div className="flex justify-center items-center gap-8 mt-12">
                  <button
                    onClick={prevSlide}
                    className="w-14 h-14 rounded-full border border-brand-dark/10 flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <div className="flex gap-2">
                    {filteredItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentIndex
                            ? 'bg-brand-turquoise w-8'
                            : 'bg-brand-dark/10 w-2 hover:bg-brand-dark/30'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="w-14 h-14 rounded-full border border-brand-dark/10 flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-all duration-300"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <p className="text-brand-dark/40 font-medium">No updates found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
      />
    </section>
  )
}
