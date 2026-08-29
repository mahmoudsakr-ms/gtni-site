'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { ToggleLeft } from 'lucide-react'

import type { CheckboxFieldClient } from 'payload'

/**
 * CheckboxField — Rendered as a shadcn/ui Switch toggle.
 */
export const CheckboxField: React.FC<{
  path: string
  field?: CheckboxFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue } = useField<boolean>({ path })

  return (
    <FieldWrapper path={path} description={description} required={required}>
      <div className="flex items-center gap-3 p-3 rounded-lg border border-input bg-background">
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => setValue(checked)}
          disabled={readOnly}
          id={`switch-${path}`}
        />
        <Label
          htmlFor={`switch-${path}`}
          className="text-sm cursor-pointer flex items-center gap-1.5"
        >
          <ToggleLeft size={14} className="text-muted-foreground" />
          {label}
        </Label>
      </div>
    </FieldWrapper>
  )
}

export default CheckboxField
