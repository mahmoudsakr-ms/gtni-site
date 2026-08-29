'use client'
import React, { useEffect } from 'react'
import { useForm, useFormProcessing, toast, useFormFields } from '@payloadcms/ui'

// Helper function to validate file size constraints based on MIME type
const checkFileLimits = (file: { size: number; type: string }): string | null => {
  const size = file.size
  const type = file.type
  const isImage = type.startsWith('image/')
  const isVideo = type.startsWith('video/')

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
  const MAX_VIDEO_SIZE = 150 * 1024 * 1024 // 150MB
  const MAX_OTHER_SIZE = 50 * 1024 * 1024 // 50MB

  if (isImage && size > MAX_IMAGE_SIZE) {
    return `حجم الصورة كبير جداً (${(size / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للصور هو 10 ميجابايت.`
  }
  if (isVideo && size > MAX_VIDEO_SIZE) {
    return `حجم الفيديو كبير جداً (${(size / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للفيديو هو 150 ميجابايت.`
  }
  if (!isImage && !isVideo && size > MAX_OTHER_SIZE) {
    return `حجم الملف كبير جداً (${(size / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به هو 50 ميجابايت.`
  }

  return null
}

export const UploadLoader: React.FC = () => {
  const isProcessing = useFormProcessing()
  const { formRef, setProcessing, dispatchFields } = useForm()

  // Highly performant context selector: only triggers re-render when 'file' changes, not when typing other fields
  const fileField = useFormFields(([fields]) => fields.file)
  const fileObj = fileField?.value as { size?: number; type?: string; name?: string } | undefined

  // 1. React-state based watcher (for drag-and-drop or programmatic file selection)
  useEffect(() => {
    if (fileObj && typeof fileObj === 'object' && typeof fileObj.size === 'number' && typeof fileObj.type === 'string') {
      const errorMsg = checkFileLimits({ size: fileObj.size, type: fileObj.type })

      if (errorMsg) {
        // Clear form state immediately
        dispatchFields({
          type: 'UPDATE',
          path: 'file',
          value: null,
          valid: false,
        })

        // Reset native DOM file inputs
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement | null
        if (fileInput) {
          fileInput.value = ''
        }

        // Show elegant toast alert
        toast.error(errorMsg)
      }
    }
  }, [fileObj, dispatchFields, formRef])

  // 2. DOM-level events listeners (capture phase) for extra fallback protection
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    // Intercept form submission
    const handleSubmit = (event: Event): void => {
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null
      const file = fileInput?.files?.[0]

      if (file) {
        const errorMsg = checkFileLimits({ size: file.size, type: file.type })

        if (errorMsg) {
          event.preventDefault()
          event.stopPropagation()
          setProcessing(false)
          toast.error(errorMsg)
        }
      }
    }

    // Intercept direct file selection changes in file input
    const handleChange = (event: Event): void => {
      const target = event.target as HTMLInputElement | null
      if (target && target.type === 'file' && target.files && target.files.length > 0) {
        const file = target.files[0]
        const errorMsg = checkFileLimits({ size: file.size, type: file.type })

        if (errorMsg) {
          event.preventDefault()
          event.stopPropagation()
          
          target.value = ''
          
          dispatchFields({
            type: 'UPDATE',
            path: 'file',
            value: null,
            valid: false,
          })

          toast.error(errorMsg)
        }
      }
    }

    form.addEventListener('submit', handleSubmit, { capture: true })
    form.addEventListener('change', handleChange, { capture: true })
    
    return () => {
      form.removeEventListener('submit', handleSubmit, { capture: true })
      form.removeEventListener('change', handleChange, { capture: true })
    }
  }, [formRef, setProcessing, dispatchFields])

  if (!isProcessing) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Loading Spinner */}
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '1.5rem' }}>
          {/* Pulsing outer ring */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '4px solid rgba(0, 188, 212, 0.1)',
            }}
          />
          {/* Spinning ring */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: '#00bcd4',
              animation: 'gtni-spin 1s linear infinite',
            }}
          />
        </div>

        {/* Loading texts */}
        <h3
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}
        >
          جاري الرفع والمعالجة...
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
          }}
        >
          Uploading and processing media... Please wait.
        </p>
      </div>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes gtni-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
