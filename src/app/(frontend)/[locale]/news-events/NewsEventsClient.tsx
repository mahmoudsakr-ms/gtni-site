'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Calendar, ArrowRight, Clock } from 'lucide-react'
import Image from 'next/image'
import { serializeLexical } from '@/components/RichText/serialize'
import type { AppLocale } from '@/i18n/routing'
import { BASE_PATH } from '@/utilities/publicUrl'

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
  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
          className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4 max-sm:p-0 bg-black/95 backdrop-blur-sm"
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
            className={`relative w-full ${isShort ? 'max-w-md aspect-[9/16] max-h-[80vh]' : 'max-w-5xl sm:aspect-video aspect-[4/3]'} bg-zinc-900 sm:rounded-3xl rounded-none overflow-hidden shadow-2xl`}
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

// Moved type definition to top level or import
import type { NewsEventsGlobal } from '@/payload-types'
import type { NewsEventWithResolvedThumbnail } from '@/utilities/video'

type NewsItem = NewsEventWithResolvedThumbnail

const DetailsModal = ({
  isOpen,
  onClose,
  item,
  locale,
}: {
  isOpen: boolean
  onClose: () => void
  item: NewsItem | null
  locale: AppLocale
}) => {
  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!item) return null

  // Safe access helpers for item properties
  const thumbnail =
    item.thumbnail && typeof item.thumbnail === 'object' && 'url' in item.thumbnail
      ? item.thumbnail
      : null
  const publishedDate = item.publishedDate ? new Date(item.publishedDate) : new Date()
  // UX-11: format dates in the active locale instead of always English
  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 bg-black overflow-y-auto"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="min-h-screen bg-linear-to-t from-brand-dark to-transparent  relative"
          >
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 p-6 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent backdrop-blur-sm">
              <button
                onClick={onClose}
                className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm font-bold tracking-widest uppercase">Close</span>
              </button>
            </div>

            <div className="max-w-[1920px]  mx-auto px-4 pb-24">
              {/* Hero Area */}
              <div className="relative h-[70vh] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                {thumbnail?.url ? (
                  <Image
                    src={thumbnail.url}
                    alt={item.title || ''}
                    className="w-full h-full object-cover"
                    fill
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-brand-dark via-brand-dark to-brand-turquoise/20" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Main Content Area */}
              <div className="max-w-7xl mx-auto">
                {/* Title */}
                {/* h2, not h1: the page's hero title is the sole h1 (see below), and
                    this modal mounts over it rather than replacing it. */}
                <h2 className="lg:text-3xl  text-2xl font-bold text-white leading-tight mb-4">
                  {item.title}
                </h2>

                {/* Date and Type Tag */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="px-4 py-1.5 rounded-full bg-brand-turquoise text-brand-dark text-xs font-black uppercase tracking-widest">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Calendar size={16} className="text-brand-turquoise" />
                    {publishedDate.toLocaleDateString(dateLocale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Excerpt with special styling */}
                {item.excerpt && (
                  <div className="text-xl max-sm:text-base text-justify text-white/90 font-light leading-relaxed mb-12 border-s-4 border-brand-turquoise ps-8 max-sm:ps-4 max-sm:pe-4  bg-white/5 py-6 pe-6 rounded-e-2xl">
                    {item.excerpt}
                  </div>
                )}

                {/* Main Article Content */}
                <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-headings:text-white prose-strong:text-white prose-a:text-brand-turquoise prose-img:rounded-3xl mb-24">
                  {item.content?.root?.children?.length ? (
                    // Use serializeLexical directly rather than the shared <RichText>
                    // wrapper -- RichText wraps its output in its own
                    // "prose prose-slate" div, which would nest inside (and fight
                    // with) this dark "prose-invert" container's own color classes.
                    serializeLexical(item.content.root.children)
                  ) : (
                    <p className="text-white/50 italic">
                      Full story details are currently being updated by the GTNI media team.
                    </p>
                  )}
                </div>

                {/* Quick Info Section (Moved to Bottom) */}
                <div className="border-t border-white/10 pt-16 mt-16">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-8 text-brand-turquoise uppercase tracking-wider flex items-center gap-3">
                          <span className="w-8 h-px bg-brand-turquoise" />
                          Quick Info
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <Clock size={24} className="text-brand-turquoise" />
                            </div>
                            <div>
                              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                                Published
                              </p>
                              <p className="text-white/90 font-bold border-b border-brand-turquoise/20 pb-1 inline-block">
                                {publishedDate.toLocaleDateString(dateLocale, {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          {item.type === 'event' && (
                            <div className="flex items-start gap-4">
                              {/* Location removed in original code too */}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={onClose}
                          className="group relative px-10 py-5 bg-brand-turquoise text-brand-dark font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-brand-turquoise/20 overflow-hidden"
                        >
                          <span className="relative z-10 transition-colors group-hover:text-white">
                            Back to List
                          </span>
                          <div className="absolute inset-0 bg-brand-dark translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface SectionData {
  title: string
  description?: string | null
  slug: string
  layoutType: 'grid' | 'featured-with-grid' | 'tabs'
  categoryId?: string | number | null
  items: NewsItem[]
  stakeholderCats?: { id: string | number; name: string }[]
  hasNextPage?: boolean
}

interface NewsEventsClientProps {
  hero?: NewsEventsGlobal['hero']
  sections: SectionData[]
  locale: AppLocale
}

const GridSection = ({
  title,
  description,
  items,
  onItemClick,
}: {
  title: string
  description?: string | null
  items: NewsItem[]
  onItemClick: (item: NewsItem) => void
}) => {

  return (
    <section className="space-y-12">
      <div className="max-w-3xl space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark border-s-4 border-brand-turquoise ps-4">{title}</h2>
        {description && <p className="text-brand-dark/70 text-base leading-relaxed ps-4">{description}</p>}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.1 }}
              className="group flex flex-col bg-white border border-brand-dark/10 rounded-2xl overflow-hidden hover:border-brand-turquoise/40 hover:bg-brand-dark/[0.01] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              onClick={() => onItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onItemClick(item)
                }
              }}
            >
              <div className="relative aspect-video overflow-hidden">
                {item.resolvedThumbnailUrl ? (
                  <div className="absolute inset-0 bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.resolvedThumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-brand-dark via-zinc-900 to-brand-turquoise/10 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-125 group-hover:bg-brand-turquoise group-hover:border-brand-turquoise transition-all duration-300">
                    <Play
                      fill="currentColor"
                      size={20}
                      className="ml-1 text-white group-hover:text-brand-dark"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-brand-dark/60 text-sm line-clamp-2">{item.excerpt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-dark/10 text-brand-dark/40 shadow-sm">
          No videos found in this section.
        </div>
      )}
    </section>
  )
}

const FeaturedSection = ({
  title,
  description,
  items,
  onItemClick,
}: {
  title: string
  description?: string | null
  items: NewsItem[]
  onItemClick: (item: NewsItem) => void
}) => {

  const featuredLeaderItem = items.find((item) => item.isPinned) || items[0]
  const facultyItems = items.filter((item) => item.id !== featuredLeaderItem?.id)

  return (
    <section className="space-y-12">
      <div className="max-w-3xl space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark border-s-4 border-brand-turquoise ps-4">{title}</h2>
        {description && <p className="text-brand-dark/70 text-base leading-relaxed ps-4">{description}</p>}
      </div>

      {featuredLeaderItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="group flex flex-col lg:flex-row bg-white border border-brand-dark/10 rounded-3xl overflow-hidden cursor-pointer hover:border-brand-turquoise/40 hover:bg-brand-dark/[0.01] transition-all duration-300 hover:shadow-xl"
          onClick={() => onItemClick(featuredLeaderItem)}
        >
          <div className="relative lg:w-3/5 aspect-video overflow-hidden">
            {featuredLeaderItem.resolvedThumbnailUrl ? (
              <div className="absolute inset-0 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredLeaderItem.resolvedThumbnailUrl}
                  alt={featuredLeaderItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-brand-dark via-zinc-900 to-brand-turquoise/20 group-hover:scale-105 transition-transform duration-700" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-brand-turquoise transition-transform group-hover:scale-110 duration-300">
                <Play fill="currentColor" size={24} className="ml-1" />
              </div>
            </div>
          </div>
          <div className="p-8 lg:w-2/5 flex flex-col justify-center">
            <span className="inline-flex px-3 py-1 rounded bg-brand-turquoise text-brand-dark text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
              Featured Interview
            </span>
            <h3 className="text-2xl font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors">
              {featuredLeaderItem.title}
            </h3>
            <p className="text-brand-dark/70 text-sm mb-6 leading-relaxed">
              {featuredLeaderItem.excerpt}
            </p>
            <span className="text-brand-turquoise text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              Watch Interview
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </motion.div>
      )}

      {facultyItems.length > 0 && (
        <div className="space-y-6">
          {/* <h4 className="text-xl font-bold text-white border-l-2 border-brand-turquoise pl-3 font-semibold">Faculty Voices</h4> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1 }}
                className="group flex flex-col bg-white border border-brand-dark/10 rounded-2xl overflow-hidden hover:border-brand-turquoise/40 hover:bg-brand-dark/[0.01] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                onClick={() => onItemClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onItemClick(item)
                  }
                }}
              >
                <div className="relative aspect-video overflow-hidden">
                  {item.resolvedThumbnailUrl ? (
                    <div className="absolute inset-0 bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.resolvedThumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-brand-dark via-zinc-900 to-brand-turquoise/10 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-125 group-hover:bg-brand-turquoise group-hover:border-brand-turquoise transition-all duration-300">
                      <Play
                        fill="currentColor"
                        size={20}
                        className="ml-1 text-white group-hover:text-brand-dark"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <h4 className="text-base font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-brand-dark/60 text-xs line-clamp-2">{item.excerpt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

const TabsSection = ({
  title,
  description,
  initialItems,
  initialHasNextPage,
  stakeholderCats,
  onItemClick,
}: {
  title: string
  description?: string | null
  initialItems: NewsItem[]
  initialHasNextPage: boolean
  stakeholderCats: { id: string | number; name: string }[]
  onItemClick: (item: NewsItem) => void
}) => {
  const [communityItems, setCommunityItems] = useState<NewsItem[]>(initialItems)
  const [communityPage, setCommunityPage] = useState(1)
  const [communityHasNextPage, setCommunityHasNextPage] = useState(initialHasNextPage)
  const [activeStakeholder, setActiveStakeholder] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  // UX-15: distinct from the "no results" empty state -- true only when the
  // request itself failed, not when it succeeded with zero matches.
  const [fetchError, setFetchError] = useState(false)



  // Handle Search Input Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchInput])

  // Fetch paginated community items
  const fetchCommunityItems = useCallback(
    async (pageToFetch: number, isLoadMore: boolean) => {
      try {
        if (!isLoadMore) {
          setIsTransitioning(true)
        } else {
          setLoadingMore(true)
        }
        const params = new URLSearchParams()
        params.append('page', String(pageToFetch))
        params.append('limit', '9')
        if (activeStakeholder !== 'all') {
          params.append('category', activeStakeholder)
        } else {
          params.append('categories', stakeholderCats.map((cat) => String(cat.id)).join(','))
        }
        if (searchQuery) {
          params.append('search', searchQuery)
        }

        const res = await fetch(`${BASE_PATH}/api/custom-news-events?${params.toString()}`)
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const data = await res.json()

        if (data && data.docs) {
          if (isLoadMore) {
            setCommunityItems((prev) => {
              // Deduplicate docs to prevent React non-unique key warning
              const newDocs = data.docs.filter(
                (newDoc: NewsItem) => !prev.some((p) => p.id === newDoc.id),
              )
              return [...prev, ...newDocs]
            })
          } else {
            setCommunityItems(data.docs)
          }
          setCommunityPage(pageToFetch)
          setCommunityHasNextPage(data.hasNextPage)
          // Clear any previous error now that a fetch has actually succeeded
          setFetchError(false)
        }
      } catch (error) {
        console.error('Error fetching community items:', error)
        setFetchError(true)
      } finally {
        setIsTransitioning(false)
        setLoadingMore(false)
      }
    },
    [activeStakeholder, searchQuery, stakeholderCats],
  )

  // Refetch when stakeholder tab or search query changes
  useEffect(() => {
    if (activeStakeholder !== 'all' || searchQuery !== '') {
      fetchCommunityItems(1, false)
    } else {
      setCommunityItems(initialItems)
      setCommunityPage(1)
      setCommunityHasNextPage(initialHasNextPage)
    }
  }, [activeStakeholder, searchQuery, fetchCommunityItems, initialItems, initialHasNextPage])

  const stakeholderTabs = [
    { label: 'All', value: 'all' },
    ...stakeholderCats.map((cat) => ({ label: cat.name, value: cat.name })),
  ]

  return (
    <section className="space-y-12">
      <div className="max-w-3xl space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark border-s-4 border-brand-turquoise ps-4">{title}</h2>
        {description && <p className="text-brand-dark/70 text-base leading-relaxed ps-4">{description}</p>}
      </div>

      {/* Filtering and Search Area */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-brand-dark/[0.02] border border-brand-dark/10 p-6 rounded-3xl shadow-xs">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {stakeholderTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStakeholder(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeStakeholder === tab.value
                  ? 'text-brand-dark bg-brand-turquoise font-bold shadow-md shadow-brand-turquoise/20'
                  : 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-turquoise/10 hover:border-brand-turquoise/30 bg-white border border-brand-dark/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-2.5 text-sm text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:border-brand-turquoise/50 transition-colors"
          />
        </div>
      </div>

      {/* UX-15: visible, distinct-from-"no results" error state for failed fetches */}
      {fetchError && (
        <div
          role="alert"
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          Something went wrong loading these results. Please try again.
        </div>
      )}

      {/* Stakeholder Videos Grid */}
      {communityItems.length > 0 ? (
        <div className="space-y-12">
          <div className="relative min-h-[200px]">
            {/* Transition Spinner Overlay */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl gap-4">
                <div className="w-10 h-10 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin" />
                <p className="text-brand-dark/80 text-sm font-medium animate-pulse">Loading content...</p>
              </div>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {communityItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 3) * 0.1 }}
                  className="group flex flex-col bg-white border border-brand-dark/10 rounded-2xl overflow-hidden hover:border-brand-turquoise/40 hover:bg-brand-dark/[0.01] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                  onClick={() => onItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onItemClick(item)
                    }
                  }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {item.resolvedThumbnailUrl ? (
                      <div className="absolute inset-0 bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.resolvedThumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-brand-dark via-zinc-900 to-brand-turquoise/10 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-125 group-hover:bg-brand-turquoise group-hover:border-brand-turquoise transition-all duration-300">
                        <Play
                          fill="currentColor"
                          size={20}
                          className="ml-1 text-white group-hover:text-brand-dark"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <h3 className="text-base font-bold text-brand-dark group-hover:text-brand-turquoise transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-brand-dark/60 text-xs line-clamp-2">{item.excerpt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Load More Pagination */}
          {communityHasNextPage && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => fetchCommunityItems(communityPage + 1, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-brand-dark text-white font-bold hover:bg-brand-turquoise hover:text-brand-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-brand-turquoise/20"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-brand-dark/10 text-brand-dark/40 shadow-sm">
          {isTransitioning || loadingMore ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin" />
              <p>Searching items...</p>
            </div>
          ) : (
            <p>No videos found matching this filter or search query.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default function NewsEventsClient({ hero, sections, locale }: NewsEventsClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null)

  // Handle smooth scroll-on-arrival for hash anchors
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash
      if (hash) {
        const targetId = hash.replace('#', '')
        const element = document.getElementById(targetId)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      }
    }

    handleHashScroll()

    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [])

  const handleItemClick = (item: NewsItem) => {
    if (item.type === 'video') {
      setSelectedVideo({ url: item.videoUrl || '', title: item.title || '' })
    } else {
      setSelectedItem(item)
    }
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-brand-dark selection:bg-brand-turquoise/30">
      {/* Cinematic Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden border-b border-brand-turquoise/20 bg-brand-dark">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-turquoise/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-light/20 rounded-full blur-[120px]" />

        <div className="container mx-auto max-w-[1380px] px-6 flex justify-center items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl flex flex-col items-center pt-8"
          >
            <span className="inline-flex px-4 py-1 rounded-full bg-brand-turquoise/10 text-brand-turquoise text-sm font-medium mb-6 border border-brand-turquoise/20">
              Updates & Media
            </span>
            {hero?.title && (
              <h1 className="lg:text-4xl md:text-3xl text-2xl font-bold text-center text-white mb-4">
                {hero.title}
              </h1>
            )}
            {hero?.subtitle && (
              <p className="text-lg md:text-xl text-white/70 text-center max-w-2xl mx-auto leading-relaxed font-light mt-2">
                {hero.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-[1380px] px-6 py-16 space-y-32">
        {sections.map((section, idx) => {
          const sectionWrapper = (content: React.ReactNode) => (
            <div key={idx} id={section.slug} className="scroll-mt-32">
              {content}
            </div>
          )

          if (section.layoutType === 'grid') {
            return sectionWrapper(
              <GridSection
                title={section.title}
                description={section.description}
                items={section.items}
                onItemClick={handleItemClick}
              />
            )
          } else if (section.layoutType === 'featured-with-grid') {
            return sectionWrapper(
              <FeaturedSection
                title={section.title}
                description={section.description}
                items={section.items}
                onItemClick={handleItemClick}
              />
            )
          } else if (section.layoutType === 'tabs') {
            return sectionWrapper(
              <TabsSection
                title={section.title}
                description={section.description}
                initialItems={section.items}
                initialHasNextPage={!!section.hasNextPage}
                stakeholderCats={section.stakeholderCats || []}
                onItemClick={handleItemClick}
              />
            )
          }
          return null
        })}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
      />

      <DetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        locale={locale}
      />
    </main>
  )
}
