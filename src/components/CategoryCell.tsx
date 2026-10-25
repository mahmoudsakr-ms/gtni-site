'use client'

import React, { useEffect, useState } from 'react'
import { BASE_PATH } from '@/utilities/publicUrl'

interface MediaFolder {
  id: string | number
  title: string
}

interface CategoryCellProps {
  cellData: string | number | MediaFolder | null | undefined
  rowData: {
    id: string | number
    [key: string]: unknown
  }
}

// Convert cellData value to a string representation for select state
const getInitialValue = (val: CategoryCellProps['cellData']): string => {
  if (val && typeof val === 'object' && 'id' in val) {
    return String(val.id)
  }
  if (val !== undefined && val !== null) {
    return String(val)
  }
  return 'uncategorized'
}

export const CategoryCell: React.FC<CategoryCellProps> = (props) => {
  const { cellData, rowData } = props
  
  const initialValue = getInitialValue(cellData)
  
  const [value, setValue] = useState<string>(initialValue)
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/media-categories?limit=100`)
        if (res.ok) {
          const data = await res.json()
          setFolders(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch folders for dropdown:', err)
      } finally {
        setFetching(false)
      }
    }
    fetchFolders()
  }, [])

  // Sync state if cellData changes from parent
  useEffect(() => {
    setValue(getInitialValue(cellData))
  }, [cellData])

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    setLoading(true)

    // Convert string numeric IDs (like "1" in SQLite) back to numbers so validation passes
    const parsedValue = newValue === 'uncategorized'
      ? null
      : (isNaN(Number(newValue)) ? newValue : Number(newValue))

    try {
      const response = await fetch(`${BASE_PATH}/api/media/${rowData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: parsedValue,
        }),
      })
      if (!response.ok) {
        let errMsg = `Failed to update category. Status: ${response.status}`
        try {
          const errJson = await response.json()
          console.error('Error response from server:', errJson)
          if (errJson.errors && errJson.errors[0]) {
            errMsg += ` - ${errJson.errors[0].message}`
          }
        } catch (_) {
          try {
            const errText = await response.text()
            console.error('Error response text from server:', errText)
            errMsg += ` - ${errText}`
          } catch (__) {}
        }
        throw new Error(errMsg)
      }
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Error updating category')
      setValue(initialValue) // revert
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <span 
        style={{
          width: '12px',
          height: '12px',
          border: '1.5px solid var(--theme-elevation-300)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.6s linear infinite',
        }}
      />
    )
  }

  return (
    <div 
      className="inline-category-cell" 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
      onClick={(e) => e.stopPropagation()} // Prevent row click from navigating
    >
      <select
        value={value}
        onChange={handleChange}
        disabled={loading}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-250)',
          backgroundColor: 'var(--theme-elevation-100)',
          color: 'var(--theme-text)',
          fontSize: '0.825rem',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <option value="uncategorized">📁 Uncategorized</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            📁 {folder.title}
          </option>
        ))}
      </select>
      {loading && (
        <span 
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid var(--theme-elevation-400)',
            borderTopColor: 'var(--theme-primary)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
    </div>
  )
}
