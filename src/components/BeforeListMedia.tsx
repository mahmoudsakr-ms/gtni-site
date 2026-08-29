'use client'

import React, { useEffect, useState } from 'react'
import { Folder, Plus, Trash2, Loader2 } from 'lucide-react'
import { useSelection, useListQuery } from '@payloadcms/ui'

interface MediaFolder {
  id: string
  title: string
}

export const BeforeListMedia: React.FC = () => {
  const listQuery = useListQuery()
  const query = listQuery?.query
  const refineListData = listQuery?.refineListData

  const selection = useSelection()
  const count = selection?.count || 0
  const selected = selection?.selected || {}

  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Extract active category from the native Payload list query state
  const queryCategory = query?.where?.category
  let activeCategory = 'all'
  if (queryCategory && typeof queryCategory === 'object' && 'equals' in queryCategory) {
    const categoryObject = queryCategory as { equals?: string | number }
    activeCategory = String(categoryObject.equals ?? 'all')
  }

  // Fetch folders from Payload API
  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/media-categories?limit=100')
      if (res.ok) {
        const data = await res.json()
        setFolders(data.docs || [])
      }
    } catch (err) {
      console.error('Failed to fetch media folders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleCategoryClick = (value: string) => {
    // Use Record<string, unknown> to avoid using any while mutating where object
    const newWhere: Record<string, unknown> = { ...(query?.where || {}) }

    if (value === 'all') {
      delete newWhere.category
    } else {
      newWhere.category = {
        equals: isNaN(Number(value)) ? value : Number(value),
      }
    }

    if (refineListData) {
      refineListData({
        ...query,
        page: 1,
        where: newWhere as import('payload').Where,
      })
    }
  }

  const handleCreateFolder = async () => {
    const name = window.prompt('Enter new folder name:')
    if (!name || !name.trim()) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/media-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name.trim(),
        }),
      })

      if (res.ok) {
        await fetchFolders()
      } else {
        const errData = await res.json()
        alert(errData.errors?.[0]?.message || 'Failed to create folder')
      }
    } catch (err) {
      console.error(err)
      alert('Error creating folder')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteFolder = async (e: React.MouseEvent, folder: MediaFolder) => {
    e.stopPropagation() // Prevent selecting the folder when clicking delete
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the folder "${folder.title}"? Any files in this folder will be uncategorized.`,
    )
    if (!confirmDelete) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/media-categories/${folder.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        // If the deleted folder was active, clear the category filter and reset page
        if (activeCategory === String(folder.id)) {
          const newWhere: Record<string, unknown> = { ...(query?.where || {}) }
          delete newWhere.category
          if (refineListData) {
            refineListData({
              ...query,
              page: 1,
              where: newWhere as import('payload').Where,
            })
          }
        }
        await fetchFolders()
      } else {
        alert('Failed to delete folder')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting folder')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkMove = async (targetFolderId: string) => {
    if (!targetFolderId) return

    const selectedIds: string[] = []
    if (selected instanceof Map) {
      selected.forEach((val, key) => {
        if (val) selectedIds.push(String(key))
      })
    } else {
      const selectedObj = selected as Record<string | number, boolean>
      Object.keys(selectedObj || {}).forEach((key) => {
        if (selectedObj[key]) selectedIds.push(key)
      })
    }

    if (selectedIds.length === 0) return

    const confirmMove = window.confirm(
      `Are you sure you want to move the ${selectedIds.length} selected file(s) to "${
        targetFolderId === 'uncategorized'
          ? 'Uncategorized'
          : folders.find((f) => String(f.id) === String(targetFolderId))?.title || 'Selected Folder'
      }"?`
    )
    if (!confirmMove) return

    setActionLoading(true)
    let successCount = 0
    let failCount = 0

    const parsedCategory = targetFolderId === 'uncategorized'
      ? null
      : (isNaN(Number(targetFolderId)) ? targetFolderId : Number(targetFolderId))

    try {
      for (const id of selectedIds) {
        const parsedId = isNaN(Number(id)) ? id : Number(id)
        try {
          const res = await fetch(`/api/media/${parsedId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: parsedCategory,
            }),
          })
          if (res.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          console.error(`Failed to move file ${id}:`, err)
          failCount++
        }
      }
      alert(`Successfully moved ${successCount} file(s).` + (failCount > 0 ? ` Failed to move ${failCount} file(s).` : ''))
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Error during bulk move operation')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="media-folders-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-text)',
          }}
        >
          Folders
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--theme-elevation-600)' }}>
                {count} selected:
              </span>
              <select
                onChange={(e) => {
                  handleBulkMove(e.target.value)
                  e.target.value = ''
                }}
                disabled={actionLoading}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--theme-elevation-200)',
                  backgroundColor: 'var(--theme-elevation-100)',
                  color: 'var(--theme-text)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">📁 Move to...</option>
                <option value="uncategorized">📁 Uncategorized</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    📁 {folder.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={handleCreateFolder}
            disabled={actionLoading}
            className="media-folder-create-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'var(--theme-elevation-100)',
              color: 'var(--theme-text)',
              transition: 'all 0.2s ease',
            }}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            New Folder
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--theme-elevation-550)',
          }}
        >
          <Loader2 className="animate-spin" size={20} />
          <span>Loading folders...</span>
        </div>
      ) : (
        <div className="media-folders-list">
          {/* Static 'All Files' Folder */}
          <button
            type="button"
            onClick={() => handleCategoryClick('all')}
            className={`media-folder-btn ${activeCategory === 'all' ? 'media-folder-btn--active' : ''}`}
            style={{ fontSize: '1.05rem', padding: '12px 24px' }}
          >
            <Folder size={18} />
            All Files
          </button>

          {/* Dynamic Folders from Database */}
          {folders.map((folder) => {
            const isActive = activeCategory === folder.id
            return (
              <div
                key={folder.id}
                className="media-folder-pill-wrapper"
                style={{ position: 'relative' }}
              >
                <button
                  type="button"
                  onClick={() => handleCategoryClick(folder.id)}
                  className={`media-folder-btn ${isActive ? 'media-folder-btn--active' : ''}`}
                  style={{ fontSize: '1.05rem', padding: '12px 24px', paddingRight: '44px' }}
                >
                  <Folder size={18} />
                  {folder.title}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteFolder(e, folder)}
                  disabled={actionLoading}
                  className="media-folder-delete-icon"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--theme-elevation-400)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isActive ? '#fff' : 'var(--theme-error-500)'
                    e.currentTarget.style.backgroundColor = isActive
                      ? 'rgba(255,255,255,0.1)'
                      : 'var(--theme-elevation-150)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive
                      ? 'rgba(255,255,255,0.7)'
                      : 'var(--theme-elevation-400)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  title="Delete Folder"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
          {!loading && folders.length === 0 && (
            <div
              style={{
                padding: '12px 0',
                fontSize: '0.95rem',
                color: 'var(--theme-elevation-400)',
                fontStyle: 'italic',
              }}
            >
              No folders created yet. Click &quot;New Folder&quot; to add one!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
