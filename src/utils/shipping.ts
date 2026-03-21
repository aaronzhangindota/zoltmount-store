import type { ShippingZone } from '../store/adminStore'
import type { Product } from '../data/products'
import type { CartItem } from '../store/cartStore'

/**
 * Calculate shipping cost.
 * Uses configured shipping zones if available, otherwise falls back to:
 * - FREE for orders >= $49
 * - $9.99 flat rate for orders < $49
 */
export function calculateShipping(
  items: CartItem[],
  products: Product[],
  shippingZones: ShippingZone[],
  country: string = 'US',
  subtotal: number = 0,
): number {
  // Fallback: no shipping zones configured
  if (shippingZones.length === 0) {
    return subtotal >= 49 ? 0 : 9.99
  }

  // Find the zone matching selected country
  let zone = shippingZones.find((z) => z.countries.includes(country))
  if (!zone) {
    // Fallback to zone with highest sortOrder (catch-all zone)
    zone = [...shippingZones].sort((a, b) => b.sortOrder - a.sortOrder)[0]
  }
  if (!zone) {
    return subtotal >= 49 ? 0 : 9.99
  }

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product.id)
    const weight = product?.shippingWeight ?? 5
    return sum + weight * item.quantity
  }, 0)

  // Formula: [initialPrice + max(totalWeight - 1, 0) * incrementalPrice] * (1 + fuelSurchargeRate)
  const base = zone.initialPrice + Math.max(totalWeight - 1, 0) * zone.incrementalPrice
  return Math.round(base * (1 + zone.fuelSurchargeRate) * 100) / 100
}
