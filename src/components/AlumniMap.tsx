'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/animations/AnimatedSection'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps'

// Provide a reliable local path to the downloaded TopoJSON by importing it directly
// This prevents 500 errors on production servers when fetching static JSON files over HTTP.
import geoData from '../../public/world-110m.json'
const geoUrl = geoData

// GTNI Location (Gouna, Egypt)
const gtniCoords: [number, number] = [33.6795, 27.3942] // [longitude, latitude]

// Real coordinates for the countries [longitude, latitude]
const alumniLocations = [
  {
    country: 'Iraq',
    city: 'Baghdad',
    coordinates: [44.3661, 33.3152] as [number, number],
  },
  {
    country: 'England',
    city: 'London',
    coordinates: [-0.1276, 51.5074] as [number, number],
  },
  {
    country: 'Bahrain',
    city: 'Manama',
    coordinates: [50.5833, 26.2167] as [number, number],
  },
  {
    country: 'Saudi Arabia',
    city: 'Riyadh',
    coordinates: [46.6753, 24.7136] as [number, number],
  },
  {
    country: 'UAE',
    city: 'Dubai',
    coordinates: [55.2708, 25.2048] as [number, number],
  },
  {
    country: 'Switzerland',
    city: 'Zurich',
    coordinates: [8.5417, 47.3769] as [number, number],
  },
  {
    country: 'Nigeria',
    city: 'Abuja',
    coordinates: [7.4951, 9.0579] as [number, number],
  },
  {
    country: 'Germany',
    city: 'Berlin',
    coordinates: [13.405, 52.52] as [number, number],
  },
]

export const AlumniMap = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(2.8)
  const [mapCenter, setMapCenter] = useState<[number, number]>([25, 35])

  // Prevent hydration errors and handle responsive zoom
  useEffect(() => {
    setMounted(true)

    const handleResize = () => {
      // Mobile screens need more zoom and different centering due to vertical layout
      if (window.innerWidth < 768) {
        setZoomLevel(3.5) // Higher zoom for mobile
        setMapCenter([32, 35]) // Shift center slightly to balance Europe and Africa vertically
      } else {
        setZoomLevel(2.8) // Desktop zoom
        setMapCenter([25, 35])
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative py-24 bg-brand-dark overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#53b5b2_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-turquoise/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-light/5 rounded-full blur-[100px]" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection variant="fade-up">
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-brand-turquoise" />
              <span className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.3em]">
                Global Presence
              </span>
              <span className="h-px w-12 bg-brand-turquoise" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our Alumni Around the World
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              GTNI graduates are making a difference in healthcare across the globe.
              <span className="block mt-2 text-sm text-brand-turquoise/70 italic">
                * Pins represent alumni working locations — not institute branches.
              </span>
            </p>
          </header>
        </AnimatedSection>

        {/* Map Container */}
        <AnimatedSection variant="fade-up" delay={0.2}>
          <div className="relative max-w-5xl mx-auto aspect-[3/4] sm:aspect-[4/5] md:aspect-[16/9] lg:aspect-[2/1] bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
            {mounted && (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 130,
                  center: mapCenter,
                }}
                className="w-full h-full object-cover"
                style={{ backgroundColor: 'transparent' }}
              >
                <ZoomableGroup zoom={zoomLevel} minZoom={1} maxZoom={6} center={mapCenter}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="rgba(83, 181, 178, 0.08)"
                          stroke="rgba(83, 181, 178, 0.2)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { fill: 'rgba(83, 181, 178, 0.15)', outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Draw connection lines from GTNI to Alumni Locations */}
                  {alumniLocations.map((loc, i) => (
                    <Line
                      key={`line-${i}`}
                      from={gtniCoords}
                      to={loc.coordinates}
                      stroke="rgba(83, 181, 178, 0.3)"
                      strokeWidth={1}
                      strokeLinecap="round"
                      strokeDasharray="4,4"
                      className="animate-[dash_2s_linear_infinite]"
                    />
                  ))}

                  {/* GTNI Home Base - Egypt */}
                  <Marker coordinates={gtniCoords}>
                    <g className="cursor-default">
                      <circle
                        cx={0}
                        cy={0}
                        r={4}
                        fill="#25234e"
                        stroke="#53b5b2"
                        strokeWidth={1.5}
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={10}
                        fill="none"
                        stroke="#53b5b2"
                        strokeWidth={1}
                        opacity={0.5}
                      >
                        <animate
                          attributeName="r"
                          values="4;14;4"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0;0.8"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={-10}
                        y={-8}
                        textAnchor="middle"
                        fill="#53b5b2"
                        fontSize={6}
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        GTNI
                      </text>
                    </g>
                  </Marker>

                  {/* Alumni Location Pins */}
                  {alumniLocations.map((loc, index) => {
                    const isActive = activeIndex === index
                    return (
                      <Marker
                        key={loc.country}
                        coordinates={loc.coordinates}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={() => setActiveIndex(isActive ? null : index)}
                        role="button"
                        tabIndex={0}
                        aria-label={loc.country}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setActiveIndex(isActive ? null : index)
                          }
                        }}
                      >
                        <g className="cursor-pointer outline-none tap-highlight-transparent">
                          <circle
                            cx={0}
                            cy={0}
                            r={isActive ? 8 : 6}
                            fill="none"
                            stroke="#53b5b2"
                            strokeWidth={0.5}
                            opacity={isActive ? 0.8 : 0.4}
                          >
                            <animate
                              attributeName="r"
                              values={isActive ? '6;12;6' : '4;8;4'}
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.6;0;0.6"
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle
                            cx={0}
                            cy={0}
                            r={isActive ? 3.5 : 2.5}
                            fill="#53b5b2"
                            stroke="#fff"
                            strokeWidth={1}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                          {isActive && (
                            <g transform="translate(0, -15)">
                              <rect
                                x={-30}
                                y={-18}
                                width={60}
                                height={16}
                                rx={2}
                                fill="#ffffff"
                                stroke="rgba(83,181,178,0.3)"
                              />
                              <text
                                textAnchor="middle"
                                y={-7}
                                fill="#1a1a1a"
                                fontSize={6}
                                fontWeight="bold"
                              >
                                {loc.country}
                              </text>
                              <path
                                d="M-3,-2 L3,-2 L0,2 Z"
                                fill="#ffffff"
                                stroke="rgba(83,181,178,0.3)"
                              />
                            </g>
                          )}
                        </g>
                      </Marker>
                    )
                  })}
                </ZoomableGroup>
              </ComposableMap>
            )}

            {/* CSS Animation for dashed lines */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes dash {
                to { stroke-dashoffset: -8; }
              }
            `,
              }}
            />
          </div>
        </AnimatedSection>

        {/* Country Cards */}
        <AnimatedSection variant="fade-up" delay={0.4}>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-5xl mx-auto">
            {alumniLocations.map((loc, i) => (
              <motion.div
                key={loc.country}
                whileHover={{ scale: 1.05, y: -4 }}
                onHoverStart={() => setActiveIndex(i)}
                onHoverEnd={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveIndex(activeIndex === i ? null : i)
                  }
                }}
                className={`group relative text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                  activeIndex === i
                    ? 'bg-brand-turquoise/10 border-brand-turquoise/40 shadow-lg shadow-brand-turquoise/10'
                    : 'bg-white/3  border-white/10 hover:border-brand-turquoise/30'
                }`}
              >
                <div className="text-xs font-bold text-white mb-1 truncate">{loc.country}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-500 italic">
            This map shows countries where our alumni are currently located and working. GTNI does
            not have branches in these countries.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AlumniMap
