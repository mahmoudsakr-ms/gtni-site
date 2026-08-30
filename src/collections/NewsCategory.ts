import type { CollectionConfig } from 'payload'

export const NewsCategory: CollectionConfig = {
  slug: 'news-category',
  defaultSort: 'name',
  admin: {
    hidden: true,
    useAsTitle: 'name',
    group: 'News & Events',
    defaultColumns: ['name', 'order', 'visible'],
    description: 'Categories for news stories, events, and videos. Grouping and tabs are managed in Page Settings (Global).',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        description: 'Optional display order index.',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible',
      admin: {
        description: 'Uncheck to hide this category from frontend queries.',
      },
    },
  ],
}
