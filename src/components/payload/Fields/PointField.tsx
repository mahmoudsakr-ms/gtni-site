'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { MapPin } from 'lucide-react'

import type { PointFieldClient } from 'payload'

/**
 * PointField — Separate latitude/longitude inputs with coordinate preview.
 */
export const PointField: React.FC<{
  path: string
  field?: PointFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue } = useField<[number, number]>({ path })
  const lng = Array.isArray(value) ? value[0] : 0
  const lat = Array.isArray(value) ? value[1] : 0

  const hasValue = Array.isArray(value) && (value[0] !== 0 || value[1] !== 0)

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={MapPin}
      headerExtra={
        hasValue ? (
          <Badge variant="secondary" className="text-xs font-mono">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Badge>
        ) : null
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
          <Input
            type="number"
            value={lng}
            onChange={(e) => setValue([Number(e.target.value), lat])}
            step="any"
            readOnly={readOnly}
            disabled={readOnly}
            placeholder="0.0000"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
          <Input
            type="number"
            value={lat}
            onChange={(e) => setValue([lng, Number(e.target.value)])}
            step="any"
            readOnly={readOnly}
            disabled={readOnly}
            placeholder="0.0000"
          />
        </div>
      </div>
    </FieldWrapper>
  )
}

export default PointField
