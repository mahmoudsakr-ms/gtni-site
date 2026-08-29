'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useInView } from 'framer-motion'
import Image from 'next/image'
import { Volume2, VolumeX } from 'lucide-react'

interface AboutHeroMediaProps {
  type?: 'image' | 'video' | null
  heroImageUrl?: string | null
  heroTitle?: string
  videoUrl?: string | null
  externalVideoUrl?: string | null
  videoSource?: 'local' | 'external' | null
}

export const AboutHeroMedia: React.FC<AboutHeroMediaProps> = ({
  type = 'image',
  heroImageUrl,
  heroTitle = 'About GTNI',
  videoUrl,
  externalVideoUrl,
  videoSource = 'local',
}) => {
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isInView = useInView(containerRef, { amount: 0.3 })

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

  // Handle auto-pause/play based on visibility (saves CPU/GPU when out of view)
  useEffect(() => {
    const handlePlayback = async () => {
      if (type === 'video') {
        if (videoSource === 'local' && videoRef.current) {
          if (isInView) {
            try {
              await videoRef.current.play()
            } catch (error) {
              console.log('Autoplay was prevented, falling back to muted playback:', error)
              setIsMuted(true)
              try {
                if (videoRef.current) {
                  videoRef.current.muted = true
                  await videoRef.current.play()
                }
              } catch (mutedError) {
                console.log('Muted autoplay also failed (normal browser behavior):', mutedError)
              }
            }
          } else {
            videoRef.current.pause()
          }
        } else if (videoSource === 'external') {
          // Pause/Play YouTube video using Iframe API
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
  }, [isInView, type, videoSource, sendYoutubeCommand, disableCaptionsRepeatedly])

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

  // Construct a static YouTube embed URL.
  // We keep it static (with mute=1) to prevent the iframe from reloading when isMuted changes.
  const youtubeUrl = useMemo(() => {
    if (!externalVideoUrl) return ''
    
    const ytMatch = externalVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/)
    const videoId = ytMatch ? ytMatch[1] : ''

    if (!videoId) return externalVideoUrl

    // Note: enablejsapi=1 is crucial to allow postMessage control
    // cc_load_policy=3 is the standard to turn off captions by default
    // vq=highres requests the highest available resolution (including 1440p/4K)
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&enablejsapi=1&cc_load_policy=3&iv_load_policy=3&vq=highres`
  }, [externalVideoUrl])

  // Determine what to render based on the type
  const isVideo = type === 'video'

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full overflow-hidden">
      {isVideo ? (
        <>
          {videoSource === 'local' && videoUrl ? (
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover scale-110 opacity-95"
              style={{ transform: 'translateZ(0)' }}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            youtubeUrl && (
              <div className="absolute inset-0 w-full h-full opacity-95 pointer-events-none">
                <iframe
                  ref={iframeRef}
                  src={youtubeUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  onLoad={() => {
                    disableCaptionsRepeatedly()
                  }}
                ></iframe>
              </div>
            )
          )}

          {/* Sound Control Button for Video */}
          {((videoSource === 'local' && videoUrl) || (videoSource === 'external' && externalVideoUrl)) && (
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
        /* Image rendering (Default) */
        heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={heroTitle}
            fill
            sizes="100vw"
            quality={100}
            className="w-full h-full object-cover scale-110"
            style={{ transform: 'translateZ(0)' }}
            priority
          />
        )
      )}

      {/* Multi-layer Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-brand-dark/25 via-brand-dark/5 to-transparent pointer-events-none" />
    </div>
  )
}
