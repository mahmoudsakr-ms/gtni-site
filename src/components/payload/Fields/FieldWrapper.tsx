'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface FieldWrapperProps {
  path: string
  label?: unknown
  description?: unknown
  required?: boolean
  icon?: LucideIcon
  className?: string
  children: React.ReactNode
  /** Show character count */
  charCount?: number
  maxLength?: number
  /** Extra content in the header row (right side) */
  headerExtra?: React.ReactNode
}

export const getLocalizedLabel = (label: unknown): string => {
  if (!label) return ''
  if (typeof label === 'string') return label
  if (typeof label === 'object') {
    const record = label as Record<string, unknown>
    if ('en' in record && typeof record.en === 'string') return record.en
    const firstVal = Object.values(record)[0]
    if (typeof firstVal === 'string') return firstVal
  }
  return String(label)
}

export const getLocalizedPlaceholder = (placeholder: unknown): string | undefined => {
  if (!placeholder) return undefined
  if (typeof placeholder === 'string') return placeholder
  if (typeof placeholder === 'object') {
    const record = placeholder as Record<string, unknown>
    if ('en' in record && typeof record.en === 'string') return record.en
    const firstVal = Object.values(record)[0]
    if (typeof firstVal === 'string') return firstVal
  }
  return undefined
}

const renderLocalized = (value: unknown): React.ReactNode => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (React.isValidElement(value)) {
    return value
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if ('en' in record && typeof record.en === 'string') return record.en
    const values = Object.values(record)
    if (values.length > 0 && (typeof values[0] === 'string' || React.isValidElement(values[0]))) {
      return values[0] as React.ReactNode
    }
  }
  return null
}

/**
 * FieldWrapper — Premium styled wrapper for all custom fields.
 * Provides a card-like container with icon header, description, and error display.
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  path,
  label,
  description,
  required,
  icon: Icon,
  className,
  children,
  charCount,
  maxLength,
  headerExtra,
}) => {
  const { errorMessage, showError } = useField({ path })

  const renderedLabel = renderLocalized(label)
  const renderedDescription = renderLocalized(description)

  return (
    <div
      className={cn(
        'relative rounded-xl p-4 mb-3 transition-all duration-200',
        showError
          ? 'bg-red-500/5 ring-1 ring-red-500/20'
          : 'bg-[var(--theme-elevation-50)] hover:bg-[var(--theme-elevation-100)]',
        className,
      )}
      style={{ border: '1px solid var(--theme-elevation-150)' }}
    >
      {/* Header row */}
      {(renderedLabel || headerExtra) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{ background: 'var(--theme-elevation-100)' }}
              >
                <Icon size={14} style={{ color: 'var(--theme-text)' }} />
              </span>
            )}
            <span className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>
              {renderedLabel}
            </span>
            {required && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                req
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Char count pill */}
            {typeof charCount === 'number' && (
              <span
                className={cn(
                  'text-[11px] font-mono px-2 py-0.5 rounded-full',
                  maxLength && charCount > maxLength
                    ? 'bg-red-500/10 text-red-500'
                    : 'text-[var(--theme-elevation-500)]',
                )}
                style={
                  !(maxLength && charCount > maxLength)
                    ? { background: 'var(--theme-elevation-100)' }
                    : undefined
                }
              >
                {charCount}
                {maxLength ? ` / ${maxLength}` : ''}
              </span>
            )}
            {headerExtra}
          </div>
        </div>
      )}

      {/* Description */}
      {renderedDescription && (
        <div
          className="text-xs mb-2.5 leading-relaxed"
          style={{ color: 'var(--theme-elevation-500)' }}
        >
          {renderedDescription}
        </div>
      )}

      {/* Field content */}
      {children}

      {/* Error */}
      {showError && errorMessage && (
        <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-lg bg-red-500/8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}
