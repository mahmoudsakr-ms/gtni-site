import { CollectionConfig, APIError } from 'payload'
import path from 'path'

// Custom validator for filesize to prevent OOM / server timeouts
export const validateFilesize = (
  value: unknown,
  { siblingData, data }: { siblingData?: Record<string, unknown>; data?: Record<string, unknown> },
): string | true => {
  // 1. Client-side file validation (before upload starts)
  const fileObj = (siblingData?.file || data?.file) as { size?: number; type?: string } | undefined
  if (
    fileObj &&
    typeof fileObj === 'object' &&
    typeof fileObj.size === 'number' &&
    typeof fileObj.type === 'string'
  ) {
    const size = fileObj.size
    const type = fileObj.type
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
  }

  // 2. Server-side / fallback validation (after upload completes)
  if (typeof value !== 'number') return true

  const mimeType = typeof siblingData?.mimeType === 'string' ? siblingData.mimeType : ''
  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
  const MAX_VIDEO_SIZE = 150 * 1024 * 1024 // 150MB
  const MAX_OTHER_SIZE = 50 * 1024 * 1024 // 50MB

  if (isImage && value > MAX_IMAGE_SIZE) {
    return `حجم الصورة كبير جداً (${(value / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للصور هو 10 ميجابايت.`
  }
  if (isVideo && value > MAX_VIDEO_SIZE) {
    return `حجم الفيديو كبير جداً (${(value / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للفيديو هو 150 ميجابايت.`
  }
  if (!isImage && !isVideo && value > MAX_OTHER_SIZE) {
    return `حجم الملف كبير جداً (${(value / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به هو 50 ميجابايت.`
  }

  return true
}

// Custom validator for width to prevent resizing extremely large images
export const validateWidth = (value: unknown): string | true => {
  if (typeof value !== 'number') return true

  const MAX_WIDTH = 7000 // 7000 pixels
  if (value > MAX_WIDTH) {
    return `عرض الصورة كبير جداً (${value} بكسل). الحد الأقصى المسموح به لعرض الصورة هو 7000 بكسل.`
  }

  return true
}

// Custom validator for height to prevent resizing extremely large images
export const validateHeight = (value: unknown): string | true => {
  if (typeof value !== 'number') return true

  const MAX_HEIGHT = 7000 // 7000 pixels
  if (value > MAX_HEIGHT) {
    return `ارتفاع الصورة كبير جداً (${value} بكسل). الحد الأقصى المسموح به لارتفاع الصورة هو 7000 بكسل.`
  }

  return true
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media Library',
  },
  defaultSort: '-createdAt',
  admin: {
    group: 'System',
    description: 'Upload and manage images, videos, and documents',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'category', 'mimeType', 'filesize', 'createdAt'],
    listSearchableFields: ['filename', 'alt'],
    components: {
      beforeListTable: ['@/components/BeforeListMedia#BeforeListMedia'],
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const filesize = data.filesize
        const mimeType = typeof data.mimeType === 'string' ? data.mimeType : ''
        const width = data.width
        const height = data.height

        const isImage = mimeType.startsWith('image/')
        const isVideo = mimeType.startsWith('video/')

        const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
        const MAX_VIDEO_SIZE = 150 * 1024 * 1024 // 150MB
        const MAX_OTHER_SIZE = 50 * 1024 * 1024 // 50MB

        if (typeof filesize === 'number') {
          if (isImage && filesize > MAX_IMAGE_SIZE) {
            throw new APIError(
              `حجم الصورة كبير جداً (${(filesize / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للصور هو 10 ميجابايت.`,
              400,
              undefined,
              true,
            )
          }
          if (isVideo && filesize > MAX_VIDEO_SIZE) {
            throw new APIError(
              `حجم الفيديو كبير جداً (${(filesize / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به للفيديو هو 150 ميجابايت.`,
              400,
              undefined,
              true,
            )
          }
          if (!isImage && !isVideo && filesize > MAX_OTHER_SIZE) {
            throw new APIError(
              `حجم الملف كبير جداً (${(filesize / (1024 * 1024)).toFixed(2)} ميجابايت). الحد الأقصى المسموح به هو 50 ميجابايت.`,
              400,
              undefined,
              true,
            )
          }
        }

        if (isImage) {
          const MAX_WIDTH = 7000
          const MAX_HEIGHT = 7000

          if (typeof width === 'number' && width > MAX_WIDTH) {
            throw new APIError(
              `عرض الصورة كبير جداً (${width} بكسل). الحد الأقصى المسموح به لعرض الصورة هو 7000 بكسل.`,
              400,
              undefined,
              true,
            )
          }

          if (typeof height === 'number' && height > MAX_HEIGHT) {
            throw new APIError(
              `ارتفاع الصورة كبير جداً (${height} بكسل). الحد الأقصى المسموح به لارتفاع الصورة هو 7000 بكسل.`,
              400,
              undefined,
              true,
            )
          }
        }

        return data
      },
    ],
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'public/media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    // إضافة أنواع الملفات المسموح بها (MIME types)
    // No `image/*` wildcard: that includes image/svg+xml, which can embed executable
    // script and is served back unsanitized from staticDir — a stored-XSS vector.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
    ],
  },
  fields: [
    {
      name: 'uploadLoader',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/UploadLoader#UploadLoader',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'media-categories',
      label: 'Folder / Category',
      admin: {
        position: 'sidebar',
        components: {
          Cell: '@/components/CategoryCell#CategoryCell',
        },
      },
    },
    {
      name: 'filesize',
      type: 'number',
      admin: {
        readOnly: true,
        disabled: true,
      },
      validate: validateFilesize,
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        readOnly: true,
        disabled: true,
      },
      validate: validateWidth,
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        readOnly: true,
        disabled: true,
      },
      validate: validateHeight,
    },
  ],
}
