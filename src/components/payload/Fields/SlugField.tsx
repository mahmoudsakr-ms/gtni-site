'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldWrapper, getFieldErrorId, getLocalizedLabel } from './FieldWrapper'
import { Link2, Lock, Unlock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { TextFieldClient } from 'payload'

/**
 * SlugField — Auto-generates URL-friendly slugs from a source field.
 * Defaults to watching "title" field. Lock/unlock toggle + regenerate button.
 */
export const SlugField: React.FC<{
  path: string
  field?: TextFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label) || 'Slug'
  const description = clientField?.admin?.description
  const required = clientField?.required
  const sourceField = clientField?.admin?.custom?.sourceField || 'title'

  const { value, setValue, showError } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''
  const [locked, setLocked] = useState(!!stringVal)

  // Watch the source field
  const titleField = useFormFields(([fields]) => fields[sourceField])
  const titleValue = (titleField?.value as string) || ''

  const slugify = useCallback((text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  // Auto-generate when unlocked and title changes
  useEffect(() => {
    if (!locked && titleValue) {
      setValue(slugify(titleValue))
    }
  }, [locked, titleValue, slugify, setValue])

  const handleRegenerate = () => {
    if (titleValue) {
      setValue(slugify(titleValue))
    }
  }

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Link2}
      headerExtra={
        stringVal ? (
          <Badge variant="secondary" className="text-xs font-mono">
            /{stringVal}
          </Badge>
        ) : null
      }
    >
      <div className="flex items-center gap-1.5">
        <Input
          value={stringVal}
          onChange={(e) => setValue(slugify(e.target.value))}
          placeholder="auto-generated-slug"
          readOnly={readOnly || !locked}
          disabled={readOnly}
          aria-invalid={showError}
          aria-describedby={showError ? getFieldErrorId(path) : undefined}
          className={cn('font-mono text-sm', !locked && 'bg-muted/50')}
        />

        {/* Lock/Unlock */}
        <button
          type="button"
          onClick={() => setLocked(!locked)}
          disabled={readOnly}
          className={cn(
            'flex items-center justify-center w-9 h-9 shrink-0 rounded-md border transition-colors',
            locked
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-input bg-background text-muted-foreground hover:bg-accent',
          )}
          title={locked ? 'Unlock to auto-generate' : 'Lock to edit manually'}
        >
          {locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        {/* Regenerate */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={readOnly || !titleValue}
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
          title="Regenerate from title"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </FieldWrapper>
  )
}

export default SlugField
