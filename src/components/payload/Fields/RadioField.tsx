'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { FieldWrapper, getFieldErrorId, getLocalizedLabel } from './FieldWrapper'
import { CircleDot, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { RadioFieldClient } from 'payload'

/**
 * RadioField — Card-style radio button options.
 */
export const RadioField: React.FC<{
  path: string
  field?: RadioFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required
  const options = (clientField?.options || []) as { label: string; value: string }[]

  const { value, setValue, showError } = useField<string>({ path })

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={CircleDot}
    >
      <div
        role="radiogroup"
        aria-invalid={showError}
        aria-describedby={showError ? getFieldErrorId(path) : undefined}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {options.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => !readOnly && setValue(opt.value)}
              disabled={readOnly}
              className={cn(
                'relative flex items-center gap-2 p-3 rounded-lg border text-sm transition-all text-left',
                isActive
                  ? 'border-primary bg-primary/5 text-foreground font-medium shadow-sm'
                  : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                  isActive ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                )}
              >
                {isActive && <Check size={10} className="text-primary-foreground" />}
              </span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </FieldWrapper>
  )
}

export default RadioField
