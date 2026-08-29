'use client'
import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Lock, Eye, EyeOff } from 'lucide-react'

import type { TextFieldClient } from 'payload'

/**
 * PasswordField — Password input with show/hide toggle.
 */
export const PasswordField: React.FC<{
  path: string
  field?: TextFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : ''
  const [show, setShow] = useState(false)

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Lock}
    >
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={stringVal}
          onChange={(e) => setValue(e.target.value)}
          placeholder="••••••••"
          readOnly={readOnly}
          disabled={readOnly}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </FieldWrapper>
  )
}

export default PasswordField
