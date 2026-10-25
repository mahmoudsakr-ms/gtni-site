'use client'
import React, { useCallback, useRef, useEffect } from 'react'
import { useField } from '@payloadcms/ui'
import { Textarea } from '@/components/ui/textarea'
import { FieldWrapper, getFieldErrorId, getLocalizedLabel, getLocalizedPlaceholder } from './FieldWrapper'
import { AlignLeft } from 'lucide-react'

import type { TextareaFieldClient } from 'payload'

/**
 * TextareaField — Premium auto-resizing textarea with card wrapper.
 */
export const TextareaField: React.FC<{
  path: string
  field?: TextareaFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const placeholder = getLocalizedPlaceholder(clientField?.admin?.placeholder)
  const maxLength = clientField?.maxLength
  const required = clientField?.required

  const { value, setValue, showError } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    autoResize()
  }, [stringVal, autoResize])

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={AlignLeft}
      charCount={stringVal.length}
      maxLength={maxLength}
    >
      <Textarea
        ref={textareaRef}
        value={stringVal}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || `Enter ${label || 'text'}...`}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={readOnly}
        aria-invalid={showError}
        aria-describedby={showError ? getFieldErrorId(path) : undefined}
        className="min-h-[100px] resize-none bg-[var(--theme-input-bg,var(--theme-elevation-0))] border-[var(--theme-elevation-200)] focus-visible:ring-[var(--theme-elevation-300)]"
        rows={4}
      />
    </FieldWrapper>
  )
}

export default TextareaField
