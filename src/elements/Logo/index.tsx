import React from 'react'
import Image from 'next/image'
import { BASE_PATH } from '@/utilities/publicUrl'

// Custom Logo Component for Payload Admin Panel
export const Logo = () => {
  return (
    <div className="flex items-center py-1">
      <Image
        src={`${BASE_PATH}/gtni-logo-w.png`}
        alt="GTNI Logo"
        width={180}
        height={60}
        priority
        style={{
          objectFit: 'contain',
          maxHeight: '52px',
          width: 'auto',
          height: 'auto',
        }}
      />
    </div>
  )
}

// Icon version (used in top header breadcrumbs & favicons)
export const Icon = () => {
  return (
    <div className="flex items-center">
      <Image
        src={`${BASE_PATH}/gtni-logo-for-heder-top-nav.png`}
        alt="GTNI"
        width={140}
        height={36}
        priority
        style={{
          objectFit: 'contain',
          maxHeight: '34px',
          maxWidth: '140px',
          width: 'auto',
          height: 'auto',
        }}
      />
    </div>
  )
}
