import type { ShippingZone } from '../store/adminStore'
import type { Product } from '../data/products'
import type { CartItem } from '../store/cartStore'

/**
 * Calculate shipping cost.
 * If no shipping zones are configured in admin backend, returns 0 (FREE).
 * Otherwise calculates based on zone rates and product weights.
 */
export function calculateShipping(
  items: CartItem[],
  products: Product[],
  shippingZones: ShippingZone[],
  country: string = 'US',
): number {
  // No shipping zones configured → free shipping
  if (shippingZones.length === 0) return 0

  // Find the zone matching selected country
  let zone = shippingZones.find((z) => z.countries.includes(country))
  if (!zone) {
    // Fallback to zone with highest sortOrder (catch-all zone)
    zone = [...shippingZones].sort((a, b) => b.sortOrder - a.sortOrder)[0]
  }
  if (!zone) return 0

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
