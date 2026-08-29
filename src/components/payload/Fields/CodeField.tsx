'use client'
import React, { useRef } from 'react'
import { useField } from '@payloadcms/ui'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Code } from 'lucide-react'

import type { CodeFieldClient } from 'payload'

/**
 * CodeField — Monospace code editor with Tab key support + language badge.
 */
export const CodeField: React.FC<{
  path: string
  field?: CodeFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required
  const language = typeof clientField?.admin?.language === 'string' ? clientField.admin.language : 'plaintext'

  const { value, setValue } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineCount = stringVal.split('\n').length

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
      icon={Code}
      headerExtra={
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
            {language}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">{lineCount} lines</span>
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
        className="font-mono text-sm min-h-[160px] resize-y leading-relaxed"
        spellCheck={false}
      />
    </FieldWrapper>
  )
}

export default CodeField
