import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../../hooks/useProducts'
import { ProductCard } from '../Common/ProductCard'

export const FeaturedProducts: React.FC = () => {
  const { t } = useTranslation()
  const { getFeaturedProducts } = useProducts()
  const featured = getFeaturedProducts()

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">{t('featured.topPicks')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{t('featured.title')}</h2>
            <p className="text-gray-500 mt-2 max-w-md">
              {t('featured.subtitle')}
            </p>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-sm mt-4 sm:mt-0"
          >
            {t('featured.viewAll')}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
