'use client'

/**
 * C_SectionDrawer — Custom Array Field component with Drawer-based editing.
 *
 * Architecture:
 * - Wraps the default ArrayField to show rows as compact cards
 * - A SINGLE shared Drawer handles both "Add New" and "Edit Existing"
 * - The Drawer is rendered OUTSIDE the ArrayField DOM to prevent flicker
 * - A lightweight context passes `openEditDrawer(index)` to RowLabels
 * - Uses Payload's official useDrawerSlug / openModal APIs
 * - Uses pointer-events CSS pattern (never display:none on toggle)
 *
 * This component does NOT touch the database schema or migration layer.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getTranslation } from '@payloadcms/translations'
import {
  ArrayField,
  Button,
  Drawer,
  RenderFields,
  useField,
  useForm,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'

// ─── Context ─────────────────────────────────────────────────────────────────
// Passes field config + drawer opener to RowLabels.

type SectionDrawerContextValue = {
  openEditDrawer: (pathOrIndex: string | number) => void
  drawerSlug: string
  arrayPath: string
}

const SectionDrawerContext = createContext<SectionDrawerContextValue | null>(null)

/** Used by C_RowLabel to open the shared edit drawer. */
export const useSectionDrawer = () => useContext(SectionDrawerContext)

// ─── CSS ─────────────────────────────────────────────────────────────────────
// Key principle: NEVER hide .collapsible__toggle. Use pointer-events instead.

const SCOPED_STYLES = `
  /* Hide default Payload add-row button */
  .section-drawer-array > .array-field .array-field__add-row {
    display: none !important;
  }

  /* Disable the collapsible toggle's native click but keep it VISIBLE */
  .section-drawer-array .collapsible .collapsible__toggle {
    pointer-events: none;
  }

  /* Re-enable clicks ONLY on our RowLabel card */
  .section-drawer-array .member-row-label-preview {
    pointer-events: auto !important;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    width: 100%;
  }

  /* Hide the expand/collapse arrow */
  .section-drawer-array .collapsible__indicator {
    display: none !important;
  }

  /* Hide collapsible content — fields are shown in Drawer instead */
  .section-drawer-array .collapsible__content {
    display: none !important;
  }

  /* Round the row wrapper */
  .section-drawer-array .collapsible__toggle-wrap {
    border-radius: var(--style-radius-m);
    width: 100%;
  }

  /* Hide collapse/expand header buttons (keep delete & reorder) */
  .section-drawer-array .array-field__header-actions li:first-child,
  .section-drawer-array .array-field__header-actions li:nth-child(2) {
    display: none !important;
  }
`

// ─── Main Component ─────────────────────────────────────────────────────────

export const SectionDrawer: ArrayFieldClientComponent = (props) => {
  const { field, path: pathFromProps, permissions = {} } = props
  const path = (pathFromProps ?? field?.name ?? '') as string
  const { i18n } = useTranslation()
  const { dispatchFields, setModified } = useForm()

  // Static slug to ensure modal slug NEVER changes across renders
  const drawerSlug = useMemo(() => `section-drawer-${path.replace(/\./g, '-')}`, [path])
  const modal = useModal()
  const { openModal, closeModal } = modal

  const [editPath, setEditPath] = useState<string | null>(null)
  const [isNewRow, setIsNewRow] = useState(false)
  const [newRowIndex, setNewRowIndex] = useState<number | null>(null)

  const labels = useMemo(() => {
    if (field?.labels) return field.labels
    return { plural: 'Items', singular: 'Item' }
  }, [field?.labels])

  const singularLabel = getTranslation(labels?.singular, i18n)
  const drawerTitle = isNewRow ? `Add ${singularLabel}` : `Edit ${singularLabel}`

  const fields = useMemo(
    () => (field?.fields ?? []) as Parameters<typeof RenderFields>[0]['fields'],
    [field?.fields],
  )

  const { rows = [] } = (useField({ path, hasRows: true }) as unknown) as {
    rows?: unknown[]
  }

  const fieldsPermissions = useMemo(() => {
    if (permissions && typeof permissions === 'object' && 'fields' in permissions) {
      return permissions.fields as Parameters<typeof RenderFields>[0]['permissions']
    }
    return permissions as Parameters<typeof RenderFields>[0]['permissions']
  }, [permissions])

  // ─── Open edit drawer (supports index number or full path string) ──────
  const openEditDrawer = useCallback(
    (rowPathOrIndex: string | number) => {
      setIsNewRow(false)
      setNewRowIndex(null)

      let targetPath: string | null = null
      if (typeof rowPathOrIndex === 'number') {
        targetPath = `${path}.${rowPathOrIndex}`
      } else if (typeof rowPathOrIndex === 'string' && rowPathOrIndex.length > 0) {
        if (/^\d+$/.test(rowPathOrIndex)) {
          targetPath = `${path}.${rowPathOrIndex}`
        } else {
          targetPath = rowPathOrIndex
        }
      }

      if (targetPath) {
        setEditPath(targetPath)
        openModal(drawerSlug)
      }
    },
    [path, drawerSlug, openModal],
  )

  // ─── Add New ──────────────────────────────────────────────────────────
  const handleAddNew = useCallback(() => {
    const nextIndex = rows.length
    dispatchFields({ type: 'ADD_ROW', path, rowIndex: nextIndex, subFieldState: {} })
    setModified(true)
    setIsNewRow(true)
    setNewRowIndex(nextIndex)
    setEditPath(`${path}.${nextIndex}`)
    openModal(drawerSlug)
  }, [dispatchFields, setModified, path, rows.length, drawerSlug, openModal])

  // ─── Save / Cancel ────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setEditPath(null)
    setIsNewRow(false)
    setNewRowIndex(null)
    closeModal(drawerSlug)
  }, [drawerSlug, closeModal])

  const handleCancel = useCallback(() => {
    if (isNewRow && newRowIndex !== null) {
      dispatchFields({ type: 'REMOVE_ROW', path, rowIndex: newRowIndex })
      setModified(true)
    }
    setEditPath(null)
    setIsNewRow(false)
    setNewRowIndex(null)
    closeModal(drawerSlug)
  }, [isNewRow, newRowIndex, dispatchFields, setModified, path, drawerSlug, closeModal])

  // ─── Context for RowLabels ────────────────────────────────────────────
  const contextValue = useMemo<SectionDrawerContextValue>(
    () => ({ openEditDrawer, drawerSlug, arrayPath: path }),
    [openEditDrawer, drawerSlug, path],
  )

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <SectionDrawerContext.Provider value={contextValue}>
      <div className="section-drawer-array">
        <style>{SCOPED_STYLES}</style>

        {/* Custom Add Button */}
        <div style={{ marginBottom: '1rem' }}>
          <Button buttonStyle="secondary" onClick={handleAddNew}>
            + Add {singularLabel}
          </Button>
        </div>

        {/* Standard Payload ArrayField */}
        <ArrayField {...props} />

        {/* Render Drawer ONLY when isModalOpen is true to guarantee initial animateIn = true */}
        {modal.isModalOpen(drawerSlug) && editPath && (
          <Drawer slug={drawerSlug} title={drawerTitle}>
            <div style={{ paddingBottom: 'var(--gutter-h)' }}>
              <RenderFields
                fields={fields}
                parentIndexPath={editPath}
                parentPath={editPath}
                parentSchemaPath={path}
                permissions={fieldsPermissions}
                readOnly={false}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--gutter-h)' }}>
                <Button buttonStyle="primary" onClick={handleSave}>
                  {isNewRow ? 'Add & Close' : 'Done'}
                </Button>
                {isNewRow && (
                  <Button buttonStyle="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </SectionDrawerContext.Provider>
  )
}
