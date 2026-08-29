'use client'
import React from 'react'
import { RichTextField as PayloadRichTextField } from '@payloadcms/ui'
import { FieldWrapper, getLocalizedLabel } from './FieldWrapper'
import { FileText } from 'lucide-react'

import type { RichTextFieldClient } from 'payload'

/**
 * RichTextField — Premium Lexical editor wrapper with icon and card-like styling.
 * This wraps the default Payload RichText field to maintain consistency.
 */
export const RichTextField: React.FC<
  Parameters<typeof PayloadRichTextField>[0] & {
    field?: RichTextFieldClient
  }
> = (props) => {
  const { path, field: clientField } = props
  const label = getLocalizedLabel(clientField?.label)
  const description = clientField?.admin?.description
  const required = clientField?.required

  return (
    <FieldWrapper
      path={path}
      label={label}
      description={description}
      required={required}
      icon={FileText}
    >
      <div className="rounded-lg border border-[var(--theme-elevation-200)] overflow-hidden bg-[var(--theme-input-bg,var(--theme-elevation-0))]">
        <PayloadRichTextField {...props} />
      </div>
    </FieldWrapper>
  )
}

export default RichTextField
