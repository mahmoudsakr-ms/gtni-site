import { CollectionConfig } from 'payload'

export const MediaCategory: CollectionConfig = {
  slug: 'media-categories',
  labels: {
    singular: 'Media Folder',
    plural: 'Media Folders',
  },
  admin: {
    group: 'System',
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
    hidden: true,
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      unique: true,
      label: 'Folder Name',
    },
  ],
}
