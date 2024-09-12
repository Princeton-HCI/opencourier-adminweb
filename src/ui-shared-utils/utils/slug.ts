import slugify from 'slugify'

export function createSlug(name: string) {
  return (
    slugify(name, {
      lower: true,
      strict: true,
    }).toLowerCase() +
    '-' +
    (Math.random() + 1).toString(36).substring(4, 8)
  )
}
