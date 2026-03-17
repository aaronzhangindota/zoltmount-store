import { useAdminStore } from '../store/adminStore'
import type { Product, Category } from '../data/products'

export function useProducts() {
  const products = useAdminStore((s) => s.products)
  const categories = useAdminStore((s) => s.categories)

  const getProductBySlug = (slug: string): Product | undefined =>
    products.find((p) => p.slug === slug)

  const getProductsByCategory = (category: string): Product[] =>
    products.filter((p) => p.category === category)

  const getFeaturedProducts = (): Product[] =>
    products.filter((p) => p.badge === 'Best Seller')

  return { products, categories, getProductBySlug, getProductsByCategory, getFeaturedProducts }
}
