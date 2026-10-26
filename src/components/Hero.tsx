'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Image from 'next/image'
import AnimatedSection from '@/components/animations/AnimatedSection'
import { Volume2, VolumeX } from 'lucide-react'

interface HeroProps {
  type: 'video' | 'slider'
  videoUrl?: string
  externalVideoUrl?: string
  videoSource?: 'local' | 'external'
  slides?: { image: string }[]
  title?: string
  subtitle?: string
}

export const HeroClient: React.FC<HeroProps> = ({
  type,
  videoUrl,
  externalVideoUrl,
  videoSource = 'local',
  slides = [],
  title,
  subtitle,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMuted, setIsMuted] = useState(true) // Default to sound ON
  // The local hero video is a ~100MB file -- it must never download/play until the visitor
  // explicitly asks for it, so playback (for the local-video case only) starts paused and
  // only begins once this is true, set by the play-button click handler below.
  const [hasStarted, setHasStarted] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isInView = useInView(containerRef, { amount: 0.3 }) // Trigger when 30% visible

  // Send control commands to the YouTube iframe via postMessage
  const sendYoutubeCommand = useCallback((command: string, args: unknown[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args,
          }),
          '*'
        )
      } catch (err) {
        console.error('Error sending postMessage to YouTube iframe:', err)
      }
    }
  }, [])

  // Forcefully disable captions/subtitles and set high-res (1440p/2160p/highres) quality repeatedly for 5 seconds
  const disableCaptionsRepeatedly = useCallback(() => {
    let count = 0
    const interval = setInterval(() => {
      // Disabling captions
      sendYoutubeCommand('unloadModule', ['captions'])
      sendYoutubeCommand('unloadModule', ['cc'])
      sendYoutubeCommand('setOption', ['captions', 'track', {}])
      
      // Forcing highest quality targets (1440p, 4K/2160p, and highres fallback)
      sendYoutubeCommand('setPlaybackQuality', ['hd1440'])
      sendYoutubeCommand('setPlaybackQualityRange', ['hd1440', 'hd1440'])
      sendYoutubeCommand('setPlaybackQuality', ['hd2160'])
      sendYoutubeCommand('setPlaybackQualityRange', ['hd2160', 'hd2160'])
      sendYoutubeCommand('setPlaybackQuality', ['highres'])
      sendYoutubeCommand('setPlaybackQualityRange', ['highres', 'highres'])
      
      count++
      if (count > 25) {
        clearInterval(interval)
      }
    }, 200)
  }, [sendYoutubeCommand])

  // Parse YouTube video ID and construct URL with optimal background parameters
  const youtubeUrl = useMemo(() => {
    if (!externalVideoUrl) return ''
    const ytMatch = externalVideoUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/,
    )
    const videoId = ytMatch ? ytMatch[1] : ''
    if (!videoId) return externalVideoUrl

    // cc_load_policy=3 is the standard to turn off captions by default
    // vq=highres requests the highest available resolution (including 1440p/4K)
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&enablejsapi=1&cc_load_policy=3&iv_load_policy=3&disablekb=1&modestbranding=1&vq=highres`
  }, [externalVideoUrl])

  // Handle auto-pause/play based on visibility
  useEffect(() => {
    const handlePlayback = async () => {
      if (type === 'video') {
        if (videoSource === 'local' && videoRef.current) {
          if (!hasStarted) return
          if (isInView) {
            try {
              await videoRef.current.play()
            } catch (error) {
              console.log('Auto-play with sound was prevented, falling back to muted:', error)
              setIsMuted(true)
              try {
                if (videoRef.current) {
                  videoRef.current.muted = true
                  await videoRef.current.play()
                }
              } catch (muteError) {
                console.log('Muted autoplay was prevented or interrupted:', muteError)
              }
            }
          } else {
            videoRef.current.pause()
          }
        } else if (videoSource === 'external') {
          if (isInView) {
            sendYoutubeCommand('playVideo')
            disableCaptionsRepeatedly()
          } else {
            sendYoutubeCommand('pauseVideo')
          }
        }
      }
    }
    handlePlayback()
  }, [isInView, type, videoSource, hasStarted, sendYoutubeCommand, disableCaptionsRepeatedly])

  // Handle YouTube mute/unmute state changes without reloading the iframe
  useEffect(() => {
    if (type === 'video' && videoSource === 'external') {
      if (isMuted) {
        sendYoutubeCommand('mute')
      } else {
        sendYoutubeCommand('unMute')
      }
    }
  }, [isMuted, type, videoSource, sendYoutubeCommand])

  useEffect(() => {
    if (type === 'slider' && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [type, slides.length])

  return (
    <section
      ref={containerRef}
      className="relative h-[80vh] w-full mt-24 overflow-hidden flex items-center justify-center bg-brand-dark"
    >
      {/* Background Content */}
      <div className="absolute inset-0 z-0">
        {type === 'video' ? (
          <>
            {videoSource === 'local' && videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover opacity-80"
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
                {!hasStarted && (
                  <button
                    onClick={() => setHasStarted(true)}
                    aria-label="Play video"
                    className="absolute inset-0 z-20 flex items-center justify-center bg-brand-dark/30 hover:bg-brand-dark/40 transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 group-hover:bg-white transition-colors shadow-lg">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-dark translate-x-0.5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </button>
                )}
              </>
            ) : (
              youtubeUrl && (
                <div className="absolute inset-0 w-full h-full opacity-80 pointer-events-none">
                  <iframe
                    ref={iframeRef}
                    src={youtubeUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    allow="autoplay; encrypted-media"
                    onLoad={() => {
                      disableCaptionsRepeatedly()
                    }}
                  ></iframe>
                </div>
              )
            )}
            {/* <div className="absolute inset-0 bg-linear-to-b from-brand-dark/40 via-transparent to-brand-dark/60 pointer-events-none"></div> */}

            {/* Sound Control Button -- hidden for the local video until playback has actually started */}
            {(videoSource !== 'local' || hasStarted) && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-10 right-10 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer group"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isMuted ? 'Enable Sound' : 'Mute Sound'}
              </span>
            </button>
            )}
          </>
        ) : (
          <AnimatePresence mode="wait">
            {slides && slides.length > 0 && slides[currentSlide] ? (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[currentSlide].image}
                  alt={`Slide ${currentSlide + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-brand-dark/40 via-transparent to-brand-dark/60 pointer-events-none"></div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                {type === 'slider' ? 'No images found in slider' : 'Loading...'}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Hero Content Overlay */}
      <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center pointer-events-none">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection variant="fade-up" delay={0.2} duration={0.8}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic leading-tight mb-6 pointer-events-none">
              {title || null}
            </h1>
          </AnimatedSection>

          <AnimatedSection variant="fade-up" delay={0.4} duration={0.8}>
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-10 max-w-2xl mx-auto leading-relaxed pointer-events-none">
              {subtitle || null}
            </p>
          </AnimatedSection>
          {/* 
          <AnimatedSection variant="fade-up" delay={0.6} duration={0.8}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
              <button className="px-10 py-4 bg-brand-turquoise text-brand-dark font-black text-lg rounded-full hover:scale-105 transition-transform shadow-xl cursor-pointer">
                ADMISSIONS OPEN
              </button>
              <button className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-lg rounded-full hover:bg-white/20 transition-all cursor-pointer">
                OUR PROGRAMS
              </button>
            </div>
          </AnimatedSection> */}
        </div>
      </div>

      {/* Slider Controls (if slider) */}
      {type === 'slider' && slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? 'true' : undefined}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                currentSlide === index ? 'w-10 bg-brand-turquoise' : 'w-4 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
