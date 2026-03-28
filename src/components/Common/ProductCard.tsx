import React from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiShoppingCart } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Product } from '../../data/products'
import { useCartStore } from '../../store/cartStore'

interface ProductCardProps {
  product: Product
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-accent-500 text-white',
  'New': 'bg-green-500 text-white',
  'Sale': 'bg-red-500 text-white',
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image area */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center product-image-zoom">
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-3"
              loading="lazy"
            />
          ) : (
            <div className="text-center">
              <span className="text-5xl">📺</span>
              <p className="text-xs text-gray-400 mt-2 font-medium">{product.category.replace('-', ' ')}</p>
            </div>
          )}
        </div>

        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={13}
                className={star <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2 flex-1"
        >
          {product.name}
        </Link>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div>
            <span className="text-lg font-bold text-brand-700">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.inStock ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                addItem(product)
              }}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title={t('product.addToCart')}
            >
              <FiShoppingCart size={16} />
            </button>
          ) : (
            <span className="px-2.5 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-xl">
              {t('product.outOfStock', 'Sold Out')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
