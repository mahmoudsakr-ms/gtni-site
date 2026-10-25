'use client'
import React, { useMemo } from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getFieldErrorId, getLocalizedLabel } from './FieldWrapper'
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

  const { value, setValue, showError } = useField<string>({ path })
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
          aria-invalid={showError}
          aria-describedby={showError ? getFieldErrorId(path) : undefined}
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
        {/* UX-14: the valid/invalid state above is purely visual (icon swap) --
            mirror it into an off-screen live region so screen reader users get
            the same feedback as sighted users typing in this field. */}
        <span aria-live="polite" className="sr-only">
          {isValid === null ? '' : isValid ? 'Valid email address' : 'Invalid email address'}
        </span>
      </div>
    </FieldWrapper>
  )
}

export default EmailField
