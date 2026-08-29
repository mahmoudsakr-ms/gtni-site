'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { useRef } from 'react'

export type AnimationType =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom'
  | 'none'

interface AnimatedSectionProps {
  children: React.ReactNode
  variant?: AnimationType
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
  className?: string
  id?: string
}

const variants: Record<AnimationType, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
}

/**
 * A highly customizable wrapper component that provides scroll-triggered animations
 * using Framer Motion. Ideal for sections, cards, and text blocks.
 *
 * @param {AnimationType} variant - The type of animation (e.g., "fade-up", "zoom").
 * @param {number} delay - Delay before the animation starts in seconds.
 * @param {number} duration - The duration of the animation in seconds.
 * @param {number} threshold - The percentage of visibility (0 to 1) required to trigger.
 * @param {boolean} once - If true, the animation plays only once when visibility is reached.
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  className = '',
  id,
}) => {
  const ref = useRef(null)
  // We can use useInView for more complex triggers, but whileInView is built into motion
  // However, useInView is better if we want to expose some state or manage it manually.
  // For simplicity and efficiency, whileInView is usually preferred in Framer Motion.

  return (
    <motion.div
      ref={ref}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: once, amount: threshold }}
      variants={variants[variant]}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a more premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedSection
