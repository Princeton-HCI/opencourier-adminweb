export const parsePrice = (price: number | undefined) => {
  if (!price) return '$0'

  return `$${(price / 100).toFixed(2)}`
}
