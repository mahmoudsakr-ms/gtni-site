'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { Input } from '@/components/ui/input'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { Hash, Plus, Minus } from 'lucide-react'

import type { NumberFieldClient } from 'payload'

/**
 * NumberField — Premium number input with +/- stepper buttons.
 */
export const NumberField: React.FC<{
  path: string
  field?: NumberFieldClient
  readOnly?: boolean
}> = (props) => {
  const { path, field: clientField, readOnly } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required
  const min = clientField?.min
  const max = clientField?.max
  const step = typeof clientField?.admin?.step === 'number' ? clientField.admin.step : 1

  const { value, setValue } = useField<number>({ path })
  const numVal = typeof value === 'number' ? value : 0

  const increment = () => {
    const next = numVal + step
    if (max !== undefined && next > max) return
    setValue(next)
  }

  const decrement = () => {
    const next = numVal - step
    if (min !== undefined && next < min) return
    setValue(next)
  }

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={Hash}
      headerExtra={
        min !== undefined || max !== undefined ? (
          <div className="flex items-center gap-1">
            {min !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-elevation-500)',
                }}
              >
                Min: {min}
              </span>
            )}
            {max !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-elevation-500)',
                }}
              >
                Max: {max}
              </span>
            )}
          </div>
        ) : null
      }
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={decrement}
          disabled={readOnly || (min !== undefined && numVal <= min)}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 disabled:opacity-30"
          style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            color: 'var(--theme-text)',
          }}
        >
          <Minus size={14} />
        </button>

        <Input
          type="number"
          value={numVal}
          onChange={(e) => setValue(e.target.value === '' ? 0 : Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          disabled={readOnly}
          className="text-center font-mono text-lg h-10 bg-[var(--theme-input-bg,var(--theme-elevation-0))] border-[var(--theme-elevation-200)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={increment}
          disabled={readOnly || (max !== undefined && numVal >= max)}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 disabled:opacity-30"
          style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            color: 'var(--theme-text)',
          }}
        >
          <Plus size={14} />
        </button>
      </div>
    </FieldWrapper>
  )
}

export default NumberField
