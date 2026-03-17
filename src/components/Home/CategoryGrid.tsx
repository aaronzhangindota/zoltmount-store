import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../../hooks/useProducts'

const catTransKeys: Record<string, { name: string; desc: string }> = {
  fixed: { name: 'categories.fixed', desc: 'categories.fixedDesc' },
  tilt: { name: 'categories.tilt', desc: 'categories.tiltDesc' },
  'full-motion': { name: 'categories.fullMotion', desc: 'categories.fullMotionDesc' },
  ceiling: { name: 'categories.ceiling', desc: 'categories.ceilingDesc' },
  desk: { name: 'categories.desk', desc: 'categories.deskDesc' },
  stand: { name: 'categories.stand', desc: 'categories.standDesc' },
  cart: { name: 'categories.cart', desc: 'categories.cartDesc' },
  accessory: { name: 'categories.accessory', desc: 'categories.accessoryDesc' },
}

export const CategoryGrid: React.FC = () => {
  const { t } = useTranslation()
  const { categories } = useProducts()

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">{t('categories.browseByType')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            {t('categories.title')}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const keys = catTransKeys[cat.slug]
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-[60px] -translate-y-2 translate-x-2 group-hover:bg-brand-100 transition-colors" />

                <span className="text-4xl block mb-4 relative z-10">{cat.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 relative z-10">{keys ? t(keys.name) : cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1 relative z-10">{keys ? t(keys.desc) : cat.description}</p>

                <div className="flex items-center gap-1 mt-4 text-brand-600 text-sm font-medium relative z-10 group-hover:gap-2 transition-all">
                  <span>{t('categories.shopNow')}</span>
                  <FiArrowRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
