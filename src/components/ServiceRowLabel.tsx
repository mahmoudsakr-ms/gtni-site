'use client'
import { useRowLabel } from '@payloadcms/ui'

export const ServiceRowLabel = () => {
  const { data } = useRowLabel<{ serviceName?: string }>()
  return data?.serviceName || 'New Service'
}
