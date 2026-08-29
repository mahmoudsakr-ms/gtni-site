'use client'

/**
 * C_RowLabel — Custom row label for Array fields using SectionDrawer.
 *
 * Self-sufficient & zero-dependency:
 * - Derives drawerSlug automatically from useRowLabel().path if Context is unavailable
 * - Guarantees bright, visible fallback label ("Item 01", "Item 02") for empty/new rows
 * - Triggers openModal directly via useModal or sectionDrawer Context
 */

import React, { useCallback } from 'react'
import { DrawerToggler, useModal, useRowLabel } from '@payloadcms/ui'
import { useSectionDrawer } from './C_SectionDrawer'
import { User, Hash, FileText } from 'lucide-react'
import Image from 'next/image'

export const C_RowLabel = () => {
  const { data, path: rowPath, rowNumber } = useRowLabel<Record<string, unknown>>()
  const sectionDrawer = useSectionDrawer()
  const { openModal } = useModal()

  // Safely extract index whether rowNumber is provided or parsed from path
  const derivedIndex =
    typeof rowNumber === 'number'
      ? rowNumber
      : rowPath
      ? parseInt(String(rowPath).split('.').pop() || '0', 10)
      : 0

  const displayIndex = (derivedIndex ?? 0) + 1

  // Self-sufficient slug derivation if Context is outside React tree
  const arrayPath = rowPath ? String(rowPath).split('.').slice(0, -1).join('.') : ''
  const derivedSlug =
    sectionDrawer?.drawerSlug ||
    (arrayPath ? `section-drawer-${arrayPath.replace(/\./g, '-')}` : '')

  // ─── Label extraction ─────────────────────────────────────────────────
  const mainLabel =
    String(data?.name || '').trim() ||
    String(data?.label || '').trim() ||
    String(data?.title || '').trim() ||
    String(data?.subject || '').trim() ||
    `Item ${String(displayIndex).padStart(2, '0')}`

  let subLabelText = ''
  const rawSubLabel = data?.role || data?.value || data?.description || data?.subtitle
  if (rawSubLabel && typeof rawSubLabel === 'object') {
    subLabelText = 'root' in rawSubLabel ? 'Rich Text Content' : '...'
  } else if (rawSubLabel !== undefined && rawSubLabel !== null) {
    subLabelText = String(rawSubLabel)
  }

  const photo = data?.photo || data?.image || data?.avatar
  const photoUrl =
    typeof photo === 'object' && photo && 'url' in photo && typeof photo.url === 'string'
      ? photo.url
      : undefined

  // ─── Icon selection ───────────────────────────────────────────────────
  const getIcon = () => {
    if (data?.name || data?.role) return <User size={20} />
    if (data?.value || data?.label) return <Hash size={20} />
    return <FileText size={20} />
  }

  // ─── Click handler ────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    const target = rowPath || derivedIndex
    if (sectionDrawer) {
      sectionDrawer.openEditDrawer(target)
    } else if (derivedSlug) {
      openModal(derivedSlug)
    }
  }, [sectionDrawer, rowPath, derivedIndex, derivedSlug, openModal])

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <DrawerToggler
      slug={derivedSlug}
      onClick={handleClick}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        width: '100%',
        textAlign: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          cursor: 'pointer',
          padding: '0.4rem 0.6rem',
          borderRadius: 'var(--style-radius-m)',
          transition: 'all 0.2s ease',
          width: '100%',
        }}
        className="member-row-label-preview"
      >
        {/* Thumbnail / Icon */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--theme-elevation-150)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-primary)',
            border: '1px solid var(--theme-elevation-200)',
            boxShadow: 'var(--style-shadow-sm)',
          }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt=""
              width={42}
              height={42}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'var(--theme-elevation-900, #ffffff)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {mainLabel}
          </span>
          {subLabelText && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--theme-elevation-450)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subLabelText}
            </span>
          )}
        </div>
      </div>
    </DrawerToggler>
  )
}
