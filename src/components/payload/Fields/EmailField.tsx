'use client'
import React, { useMemo } from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Mail, Check, X } from 'lucide-react'

import type { EmailFieldClient } from 'payload'

/**
 * EmailField — Email input with inline validation indicator.
 */
export const EmailField: React.FC<{
  path: string
  field?: EmailFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''

  const isValid = useMemo(() => {
    if (!stringVal) return null
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringVal)
  }, [stringVal])

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Mail}
    >
      <div className="relative">
        <Input
          type="email"
          value={stringVal}
          onChange={(e) => setValue(e.target.value)}
          placeholder="email@example.com"
          readOnly={readOnly}
          disabled={readOnly}
          className="pr-9"
        />
        {isValid !== null && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <X size={14} className="text-destructive" />
            )}
          </span>
        )}
      </div>
    </FieldWrapper>
  )
}

export default EmailField
