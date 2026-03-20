import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/Common/ProductCard'

const catTransKeys: Record<string, string> = {
  fixed: 'categories.fixed',
  tilt: 'categories.tilt',
  'full-motion': 'categories.fullMotion',
  ceiling: 'categories.ceiling',
  desk: 'categories.desk',
  stand: 'categories.stand',
  cart: 'categories.cart',
  accessory: 'categories.accessory',
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation()
  const { products, categories } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category') || 'all'
  const [sort, setSort] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = categoryFilter === 'all'
      ? [...products]
      : products.filter((p) => p.category === categoryFilter)

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0))
        break
    }
    return result
  }, [products, categoryFilter, sort])

  const getCatProductCount = (slug: string) =>
    products.filter((p) => p.category === slug).length

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {categoryFilter === 'all'
              ? t('productsPage.allMounts')
              : (catTransKeys[categoryFilter] ? t(catTransKeys[categoryFilter]) : categories.find((c) => c.slug === categoryFilter)?.name || t('nav.products'))}
          </h1>
          <p className="text-gray-500 mt-2">
            {t('productsPage.productsFound', { count: filtered.length })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28">
              <h3 className="font-bold text-gray-900 mb-4">{t('productsPage.categoriesLabel')}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSearchParams({})}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('productsPage.allProducts')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchParams({ category: cat.slug })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      categoryFilter === cat.slug
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.icon} {catTransKeys[cat.slug] ? t(catTransKeys[cat.slug]) : cat.name}</span>
                    <span className="text-xs text-gray-400">{getCatProductCount(cat.slug)}</span>
                  </button>
                ))}
              </div>

              {/* Price range hint */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{t('productsPage.priceRange')}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>${Math.min(...filtered.map((p) => p.price)).toFixed(2)} – ${Math.max(...filtered.map((p) => p.price)).toFixed(2)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiFilter size={16} />
                {t('productsPage.filters')}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-sm text-gray-500">{t('productsPage.sortBy')}</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="featured">{t('productsPage.featured')}</option>
                  <option value="price-low">{t('productsPage.priceLow')}</option>
                  <option value="price-high">{t('productsPage.priceHigh')}</option>
                  <option value="rating">{t('productsPage.highestRated')}</option>
                  <option value="newest">{t('productsPage.newest')}</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">{t('productsPage.noProducts')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
