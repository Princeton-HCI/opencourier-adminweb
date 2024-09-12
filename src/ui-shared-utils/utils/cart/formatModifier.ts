import { DisplayModifier } from './flattenModifiers'
import { formatPennies } from '../money'

/**
 * Formats a modifier for display in the cart.
 * It will display the modifier name and include quantity and price if present.
 */
export const formatModifier = (modifier: DisplayModifier): string => {
  let priceStr = ''
  if (modifier.quantity) {
    priceStr += ` × ${modifier.quantity}`
    if (modifier.price) {
      priceStr += ` (+ $${formatPennies(modifier.price * modifier.quantity)})`
    }
  }
  return `${modifier.name}${priceStr}`
}
