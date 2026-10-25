import { CollectionConfig } from 'payload'

export const NewsEvents: CollectionConfig = {
  slug: 'news-events',
  defaultSort: '_order',
  orderable: true,
  labels: {
    singular: 'Post / Event',
    plural: 'Posts & Events',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'type', 'publishedDate', 'itemCategory', 'isPinned'],
    group: 'News & Events',
    description: 'Manage individual news stories, event updates, and video links',
  },
  access: {
    // Anonymous visitors only ever see published items; logged-in admins see everything
    // (including drafts) so the admin panel list/edit views keep working normally.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (data && data.isPinned && data.itemCategory) {
          const pinnedDocs = await req.payload.find({
            collection: 'news-events',
            where: {
              and: [
                { isPinned: { equals: true } },
                { itemCategory: { equals: data.itemCategory } },
              ],
            },
            limit: 100,
          })

          for (const doc of pinnedDocs.docs) {
            if (operation === 'update' && doc.id === data.id) {
              continue
            }
            await req.payload.update({
              collection: 'news-events',
              id: doc.id,
              data: {
                isPinned: false,
              },
            })
          }
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data

        // Find or create 'General' category if missing
        if (!data.itemCategory) {
          const generalCategory = await req.payload.find({
            collection: 'news-category',
            where: { name: { equals: 'General' } },
            limit: 1,
          })

          let generalId = generalCategory.docs[0]?.id

          if (!generalId) {
            const newGeneral = await req.payload.create({
              collection: 'news-category',
              data: { name: 'General' },
            })
            generalId = newGeneral.id
          }

          data.itemCategory = generalId
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: '_status',
      type: 'select',
      defaultValue: 'published',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publish status: Published (visible) or Draft (hidden)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'video',
      options: [
        { label: 'News', value: 'news' },
        { label: 'Event', value: 'event' },
        { label: 'Video', value: 'video' },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'YouTube/Vimeo URL',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'video',
        description: 'Paste the full URL (e.g., https://www.youtube.com/watch?v=...)',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image / Thumbnail',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Short Excerpt',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Full Article Content',
      admin: {
        description:
          'Optional full body shown on the article detail view below the excerpt. Leave empty for a short item (e.g. a video) that only needs the excerpt.',
      },
    },
    {
      name: 'itemCategory',
      type: 'relationship',
      relationTo: 'news-category',
      required: true,
      admin: {
        allowCreate: true,
        description: 'Select a category or click "+" to add a new one.',
      },
    },
    {
      name: 'isPinned',
      type: 'checkbox',
      label: 'Pin to top',
      admin: {
        description: 'Pin this item to show it at the top of the list / main banner.',
      },
    },
  ],
}
