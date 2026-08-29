'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useSpring, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion'

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              🔺 THE ULTIMATE PHYSICS TRIANGLE 🔺                 ║
 * ║                     Version 2.1 - CLEAN                          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                         ║
 * ║ • Magnetic Force Field Physics                                   ║
 * ║ • Particle Trail System                                          ║
 * ║ • Dynamic Glow on Interaction                                    ║
 * ║ • 3D Perspective Tilt                                            ║
 * ║ • "Breathing" Idle Animation                                      ║
 * ║ • Teleport Effect on Click                                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

interface Particle {
  id: number
  x: number
  y: number
  opacity: number
  scale: number
  rotation: number
}

interface TriangleProps {
  size: number
  inverted?: boolean
  className?: string
}

const PhysicsTriangle = ({ size, inverted, className }: TriangleProps) => {
  const ref = useRef<HTMLDivElement>(null)

  // Physics State
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring Physics
  const springConfig = { damping: 12, stiffness: 120, mass: 0.8 }
  const smoothX = useSpring(x, springConfig)
  const smoothY = useSpring(y, springConfig)

  // Visual States
  const rotate = useMotionValue(0)
  const scale = useSpring(1, { damping: 10, stiffness: 100 })
  const glowIntensity = useSpring(0, { damping: 20, stiffness: 200 })

  // 3D Transform
  const rotateX = useTransform(smoothY, [-150, 150], [20, -20])
  const rotateY = useTransform(smoothX, [-150, 150], [-20, 20])

  // State
  const [particles, setParticles] = useState<Particle[]>([])
  const [isEscaping, setIsEscaping] = useState(false)
  const [isTeleporting, setIsTeleporting] = useState(false)

  // Refs
  const positionRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const particleIdRef = useRef(0)
  const lastParticleTime = useRef(0)

  // Spawn particle trail
  const spawnParticle = useCallback(() => {
    const now = Date.now()
    if (now - lastParticleTime.current < 50) return

    lastParticleTime.current = now
    const id = particleIdRef.current++

    const newParticle: Particle = {
      id,
      x: positionRef.current.x,
      y: positionRef.current.y,
      opacity: 0.5,
      scale: 0.4 + Math.random() * 0.2,
      rotation: Math.random() * 360,
    }

    setParticles((prev) => [...prev.slice(-8), newParticle])
  }, [])

  // Handle click - Teleport
  const handleClick = useCallback(() => {
    setIsTeleporting(true)

    setTimeout(() => {
      const newX = (Math.random() - 0.5) * 200
      const newY = (Math.random() - 0.5) * 100
      positionRef.current = { x: newX, y: newY }
      x.set(newX)
      y.set(newY)
      setIsTeleporting(false)
    }, 300)
  }, [x, y])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current || isTeleporting) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      const outerRadius = 350
      const innerRadius = 100
      const panicRadius = 60

      if (distance < panicRadius) {
        // PANIC - Full escape with SPIN!
        setIsEscaping(true)

        const angle = Math.atan2(dy, dx)
        const escapeForce = 250

        targetRef.current = {
          x: -(Math.cos(angle) * escapeForce),
          y: -(Math.sin(angle) * escapeForce),
        }

        // SPIN LIKE CRAZY! 🌀
        const spinDirection = dx > 0 ? 1 : -1
        rotate.set(rotate.get() + spinDirection * 45) // Fast spin
        scale.set(1.25)
        glowIntensity.set(1)
        spawnParticle()
      } else if (distance < innerRadius) {
        // Alert - Moderate escape with spin
        setIsEscaping(true)

        const force = (innerRadius - distance) / innerRadius
        const angle = Math.atan2(dy, dx)

        targetRef.current = {
          x: -(Math.cos(angle) * force * 180),
          y: -(Math.sin(angle) * force * 180),
        }

        // Moderate spin
        const spinDirection = dx > 0 ? 1 : -1
        rotate.set(rotate.get() + spinDirection * 20)
        scale.set(1.12)
        glowIntensity.set(0.6)
        spawnParticle()
      } else if (distance < outerRadius) {
        // Aware - Slight movement
        setIsEscaping(false)

        const force = (outerRadius - distance) / outerRadius
        const angle = Math.atan2(dy, dx)

        targetRef.current = {
          x: -(Math.cos(angle) * force * 60),
          y: -(Math.sin(angle) * force * 60),
        }

        scale.set(1.03)
        glowIntensity.set(force * 0.25)
      } else {
        // Relaxed
        setIsEscaping(false)
        targetRef.current = { x: 0, y: 0 }
        scale.set(1)
        glowIntensity.set(0)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', onTouchMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [rotate, scale, glowIntensity, spawnParticle, isTeleporting])

  // Physics Animation Loop
  useAnimationFrame((time) => {
    if (isTeleporting) return

    const pos = positionRef.current
    const target = targetRef.current
    const vel = velocityRef.current

    const attraction = isEscaping ? 0.07 : 0.04
    const friction = isEscaping ? 0.86 : 0.92

    vel.x += (target.x - pos.x) * attraction
    vel.y += (target.y - pos.y) * attraction

    vel.x *= friction
    vel.y *= friction

    pos.x += vel.x
    pos.y += vel.y

    // Breathing animation when idle
    let breathingY = 0
    let breathingRotate = 0
    if (Math.abs(target.x) < 5 && Math.abs(target.y) < 5) {
      breathingY = Math.sin(time / 1500) * 8
      breathingRotate = Math.sin(time / 2000) * 2
    }

    x.set(pos.x)
    y.set(pos.y + breathingY)
    rotate.set(rotate.get() * 0.98 + breathingRotate * 0.02)

    // Decay particles
    setParticles((prev) =>
      prev
        .map((p) => ({ ...p, opacity: p.opacity * 0.9, scale: p.scale * 0.94 }))
        .filter((p) => p.opacity > 0.05),
    )
  })

  const points = inverted ? '50,90 90,10 10,10' : '50,10 90,90 10,90'
  const innerPoints = inverted ? '50,80 80,20 20,20' : '50,20 80,80 20,80'

  return (
    <>
      {/* Particle Trail */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            top: `calc(50% + ${particle.y}px)`,
            opacity: particle.opacity,
            scale: particle.scale,
            rotate: particle.rotation,
          }}
        >
          <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 100 100">
            <polygon
              points={points}
              fill="currentColor"
              className="text-brand-turquoise"
              opacity={0.25}
            />
          </svg>
        </motion.div>
      ))}

      {/* Main Triangle */}
      <motion.div
        ref={ref}
        className={`absolute z-20 cursor-pointer ${className}`}
        style={{
          x: smoothX,
          y: smoothY,
          rotateX,
          rotateY,
          rotate,
          scale,
          perspective: 1200,
          opacity: isTeleporting ? 0 : 1,
        }}
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
      >
        {/* Dynamic Glow Layer */}
        <motion.svg
          width={size * 1.4}
          height={size * 1.4}
          viewBox="0 0 100 100"
          className="absolute -top-1/5 -left-1/5 blur-xl"
          style={{ opacity: glowIntensity }}
        >
          <defs>
            <linearGradient
              id={`glow-${inverted ? 'inv' : 'norm'}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#53b5b2" />
              <stop offset="50%" stopColor="#4c6baf" />
              <stop offset="100%" stopColor="#53b5b2" />
            </linearGradient>
          </defs>
          <polygon points={points} fill={`url(#glow-${inverted ? 'inv' : 'norm'})`} />
        </motion.svg>

        {/* Core Triangle */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="relative z-10 drop-shadow-2xl"
        >
          <defs>
            <linearGradient
              id={`stroke-${inverted ? 'inv' : 'norm'}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#53b5b2" />
              <stop offset="100%" stopColor="#4c6baf" />
            </linearGradient>
          </defs>

          {/* Glass Fill */}
          <polygon
            points={points}
            fill="currentColor"
            fillOpacity={0.06}
            className="text-brand-turquoise"
          />

          {/* Main Stroke */}
          <polygon
            points={points}
            fill="none"
            stroke={`url(#stroke-${inverted ? 'inv' : 'norm'})`}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Highlight */}
          <polygon
            points={innerPoints}
            fill="none"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </>
  )
}

export const RunawayTriangles = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="container mx-auto max-w-7xl absolute inset-0 pointer-events-none overflow-hidden">
      {/* Triangle 1: Points Up */}
      <PhysicsTriangle className="bottom-16 left-10" size={80} />
      {/* <PhysicsTriangle className="bottom-16 left-42" size={80} /> */}

      {/* Triangle 2: Points Down (Inverted) */}
      <PhysicsTriangle className="bottom-16 left-26" size={80} inverted />
    </div>
  )
}

export default RunawayTriangles
