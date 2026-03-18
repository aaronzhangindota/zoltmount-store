import { useDataStore } from '../store/dataStore'
import type { Product, Category } from '../data/products'

export function useProducts() {
  const products = useDataStore((s) => s.products)
  const categories = useDataStore((s) => s.categories)

  const getProductBySlug = (slug: string): Product | undefined =>
    products.find((p) => p.slug === slug)

  const getProductsByCategory = (category: string): Product[] =>
    products.filter((p) => p.category === category)

  const getFeaturedProducts = (): Product[] =>
    products.filter((p) => p.badge === 'Best Seller')

  return { products, categories, getProductBySlug, getProductsByCategory, getFeaturedProducts }
}
