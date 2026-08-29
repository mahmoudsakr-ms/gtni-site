import { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

export const slugHook: FieldHook = ({ value, data, operation }) => {
  if (operation === 'create' || !value) {
    if (data?.title) {
      return formatSlug(data.title)
    }
  }
  return value
}
