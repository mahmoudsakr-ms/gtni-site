// src/components/payload/Fields/CustomCollapsible.tsx
'use client'
import React from 'react'
import { RenderFields } from '@payloadcms/ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { CollapsibleFieldClient } from 'payload'

export const CustomCollapsible: React.FC<
  Omit<Parameters<typeof RenderFields>[0], 'fields'> & {
    field?: CollapsibleFieldClient
    fields?: CollapsibleFieldClient['fields']
  }
> = (props) => {
  const { field } = props
  const fields = field?.fields || props.fields || []
  // Handle case where label might be an object (i18n)
  const labelText =
    typeof field?.label === 'object'
      ? field.label.en || Object.values(field.label)[0]
      : field?.label || 'Section'
  const label = typeof labelText === 'string' ? labelText : 'Section'

  return (
    <div className="my-8 border border-(--theme-elevation-200) rounded-2xl overflow-hidden shadow-sm bg-(--theme-elevation-50)/30 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group/card">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="px-6 py-5 hover:bg-(--theme-elevation-100)/50 transition-all group no-underline!">
            <div className="flex items-center gap-5 text-left">
              <div className="w-12 h-12 rounded-xl bg-(--theme-elevation-150) flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner border border-(--theme-elevation-200) group-hover/card:border-primary/50 group-hover/card:bg-primary/5">
                {label.includes('📚') ? '📚' : label.includes('🎯') ? '🎯' : '📁'}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xl tracking-tight text-(--theme-elevation-850) group-hover/card:text-primary transition-colors">
                  {label.replace(/^[^\w\s]*\s*/, '')}
                </span>
                <span className="text-[10px] text-(--theme-elevation-400) font-bold uppercase tracking-[0.2em]">
                  Manage Section Data
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-8 pb-8 pt-6 border-t border-(--theme-elevation-150) bg-white/40 dark:bg-black/20 backdrop-blur-md">
            <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
              <RenderFields {...props} fields={fields} forceRender readOnly={false} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default CustomCollapsible
