'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESETS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#000000',
  '#ffffff',
]

import type { TextFieldClient } from 'payload'

/**
 * ColorField — Color swatch, hex input, and preset palette.
 */
export const ColorField: React.FC<{
  path: string
  field?: TextFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  const { value, setValue } = useField<string>({ path })
  const stringVal = typeof value === 'string' ? value : '#000000'

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Palette}
    >
      <div className="space-y-3">
        {/* Color input + hex input */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-md border border-input shadow-sm shrink-0 cursor-pointer overflow-hidden"
            style={{ backgroundColor: stringVal }}
          >
            <input
              type="color"
              value={stringVal}
              onChange={(e) => setValue(e.target.value)}
              disabled={readOnly}
              className="opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          <Input
            value={stringVal}
            onChange={(e) => setValue(e.target.value)}
            placeholder="#000000"
            readOnly={readOnly}
            disabled={readOnly}
            className="font-mono text-sm uppercase"
            maxLength={7}
          />
        </div>

        {/* Preset palette */}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => !readOnly && setValue(color)}
              disabled={readOnly}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                stringVal.toLowerCase() === color.toLowerCase()
                  ? 'border-primary ring-2 ring-primary/20 scale-110'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </FieldWrapper>
  )
}

export default ColorField
