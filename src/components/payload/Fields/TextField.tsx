'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getLocalizedLabel, getLocalizedPlaceholder } from './FieldWrapper'
import { Type } from 'lucide-react'

import type { TextFieldClient } from 'payload'

/**
 * TextField — Premium text input with icon, char count, and card wrapper.
 */
export const TextField: React.FC<{
  path: string
  field?: TextFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const placeholder = getLocalizedPlaceholder(clientField?.admin?.placeholder)
  const maxLength = clientField?.maxLength
  const required = clientField?.required

  const { value, setValue } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Type}
      charCount={stringVal.length}
      maxLength={maxLength}
    >
      <Input
        value={stringVal}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || `Enter ${label || 'text'}...`}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={readOnly}
        className="h-10 bg-[var(--theme-input-bg,var(--theme-elevation-0))] border-[var(--theme-elevation-200)] focus-visible:ring-[var(--theme-elevation-300)]"
      />
    </FieldWrapper>
  )
}

export default TextField
