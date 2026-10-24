'use client'
import React, { useRef, useMemo, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FieldWrapper, getFieldErrorId, getLocalizedLabel } from './FieldWrapper'
import { Braces, Copy, WrapText, Check, X } from 'lucide-react'

import type { JSONFieldClient } from 'payload'

/**
 * JSONField — JSON editor with format, copy, and validation.
 */
export const JSONField: React.FC<{
  path: string
  field?: JSONFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue, showError } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : value ? JSON.stringify(value, null, 2) : ''
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = React.useState(false)

  const isValid = useMemo(() => {
    if (!stringVal.trim()) return null
    try {
      JSON.parse(stringVal)
      return true
    } catch {
      return false
    }
  }, [stringVal])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(stringVal)
      setValue(JSON.stringify(parsed, null, 2))
    } catch {
      /* invalid JSON, don't format */
    }
  }, [stringVal, setValue])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(stringVal)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [stringVal])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const newVal = stringVal.substring(0, start) + '  ' + stringVal.substring(end)
      setValue(newVal)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Braces}
      headerExtra={
        <div className="flex items-center gap-1.5">
          {/* Validation indicator */}
          {isValid !== null && (
            <Badge
              variant={isValid ? 'secondary' : 'destructive'}
              className="text-[10px] px-1.5 py-0"
            >
              {isValid ? (
                <>
                  <Check size={10} /> Valid
                </>
              ) : (
                <>
                  <X size={10} /> Invalid
                </>
              )}
            </Badge>
          )}
          {/* Format button */}
          <button
            type="button"
            onClick={handleFormat}
            disabled={!isValid}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <WrapText size={10} /> Format
          </button>
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {copied ? (
              <>
                <Check size={10} /> Copied
              </>
            ) : (
              <>
                <Copy size={10} /> Copy
              </>
            )}
          </button>
        </div>
      }
    >
      <Textarea
        ref={textareaRef}
        value={stringVal}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        disabled={readOnly}
        aria-invalid={showError}
        aria-describedby={showError ? getFieldErrorId(path) : undefined}
        className="font-mono text-sm min-h-[160px] resize-y leading-relaxed"
        spellCheck={false}
      />
    </FieldWrapper>
  )
}

export default JSONField
