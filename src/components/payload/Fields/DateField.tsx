'use client'
import React, { useMemo } from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Calendar } from 'lucide-react'

import type { DateFieldClient } from 'payload'

interface DateAdminConfig {
  pickerAppearance?: 'dayAndTime' | 'dayOnly' | 'default' | 'monthOnly' | 'timeOnly'
}

/**
 * DateField — Adaptive date/time input with formatted preview badge.
 */
export const DateField: React.FC<{
  path: string
  field?: DateFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required
  const dateConfig = clientField?.admin?.date as DateAdminConfig | undefined
  const pickerAppearance = dateConfig?.pickerAppearance || 'dayAndTime'

  const { value, setValue } = useField<string>({ path })

  const inputType = useMemo(() => {
    switch (pickerAppearance) {
      case 'timeOnly':
        return 'time'
      case 'dayOnly':
      case 'monthOnly':
        return 'date'
      default:
        return 'datetime-local'
    }
  }, [pickerAppearance])

  const formatted = useMemo(() => {
    if (!value) return null
    try {
      const d = new Date(value)
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(inputType !== 'date' ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    } catch {
      return null
    }
  }, [value, inputType])

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Calendar}
      headerExtra={
        formatted ? (
          <Badge variant="secondary" className="text-xs">
            {formatted}
          </Badge>
        ) : null
      }
    >
      <Input
        type={inputType}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => setValue(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
      />
    </FieldWrapper>
  )
}

export default DateField
