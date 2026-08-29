import { CollectionConfig, GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Returns the target path(s) to revalidate for a given collection or global slug.
 * Returns 'layout' for a full site layout-level revalidation.
 */
const getRevalidatePaths = (slug: string, isGlobal: boolean): string | string[] | null => {
  if (isGlobal) {
    switch (slug) {
      case 'header':
      case 'footer':
        // Globally shared layout components require site-wide layout revalidation
        return 'layout'
      case 'home':
        return '/'
      case 'news-events-global':
        return ['/', '/news-events']
      default:
        // By convention, other pages map directly to their route (e.g. 'about-gtni' -> '/about-gtni')
        return `/${slug}`
    }
  } else {
    switch (slug) {
      case 'news-category':
      case 'news-events':
        // Categories list changes and news items affect the news & events page and the homepage
        return ['/', '/news-events']
      case 'media':
        // Media documents can be used in dynamic cards/headers across the site; layout revalidation is safest
        return 'layout'
      case 'users':
      default:
        // Modifying admin users does not affect the public frontend cache
        return null
    }
  }
}

/**
 * Executes cache invalidation using paths or tags
 */
const triggerRevalidate = (paths: string | string[]) => {
  try {
    const pathList = Array.isArray(paths) ? paths : [paths]
    for (const p of pathList) {
      if (p === 'layout') {
        revalidatePath('/', 'layout')
      } else if (p === '/news-events') {
        revalidateTag('news-events')
      } else {
        revalidatePath(p)
      }
    }
  } catch (error) {
    console.warn('Revalidation warning:', error)
  }
}

/**
 * Utility to wrap a Global Config with targeted revalidation hooks.
 */
export const withGlobalRevalidate = (global: GlobalConfig): GlobalConfig => {
  const existingAfterChange = global.hooks?.afterChange || []
  const paths = getRevalidatePaths(global.slug, true)

  // If no revalidation path is defined, return config unchanged
  if (!paths) return global

  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [
        ...existingAfterChange,
        async ({ doc }) => {
          try {
            triggerRevalidate(paths)
          } catch (error) {
            console.error(`Error revalidating from global ${global.slug}:`, error)
          }
          return doc
        },
      ],
    },
  }
}

/**
 * Utility to wrap a Collection Config with targeted revalidation hooks.
 */
export const withCollectionRevalidate = (collection: CollectionConfig): CollectionConfig => {
  const existingAfterChange = collection.hooks?.afterChange || []
  const existingAfterDelete = collection.hooks?.afterDelete || []
  const paths = getRevalidatePaths(collection.slug, false)

  // If no revalidation path is defined, return config unchanged
  if (!paths) return collection

  const revalidateHook = async ({ doc }: { doc: unknown }) => {
    try {
      triggerRevalidate(paths)
    } catch (error) {
      console.error(`Error revalidating from collection ${collection.slug}:`, error)
    }
    return doc
  }

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...existingAfterChange, revalidateHook],
      afterDelete: [...existingAfterDelete, revalidateHook],
    },
  }
}
