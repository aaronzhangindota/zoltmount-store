import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiCheck, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../hooks/useProducts'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import { ProductCard } from '../components/Common/ProductCard'

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { products, getProductBySlug } = useProducts()
  const product = getProductBySlug(slug || '')
  const addItem = useCartStore((s) => s.addItem)
  const currentUser = useUserStore((s) => s.currentUser)
  const getMemberDiscount = useUserStore((s) => s.getMemberDiscount)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'features' | 'specs'>('features')
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('detail.notFound')}</h1>
        <Link to="/products" className="text-brand-600 hover:underline mt-4 block">{t('detail.backToProducts')}</Link>
      </div>
    )
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const memberRate = getMemberDiscount()
  const memberPrice = product.price * memberRate
  const isMember = !!currentUser

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-brand-600">{t('detail.home')}</Link>
          <FiChevronRight size={14} />
          <Link to="/products" className="hover:text-brand-600">{t('detail.products')}</Link>
          <FiChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Image */}
          <div>
            <div className="space-y-3">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage || 0]}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-8xl">📺</span>
                    <p className="text-sm text-gray-400 mt-4">{product.name}</p>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                        (selectedImage || 0) === i ? 'border-brand-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - Details */}
          <div>
            {product.badge && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                product.badge === 'Best Seller' ? 'bg-accent-100 text-accent-700'
                : product.badge === 'New' ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}>
                {product.badge}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} size={16} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="font-semibold text-sm">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviewCount.toLocaleString()} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5 flex-wrap">
              {isMember ? (
                <>
                  <span className="text-3xl font-extrabold text-brand-700">${memberPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  <span className="bg-orange-100 text-orange-600 text-sm font-bold px-2 py-0.5 rounded-full">
                    {t('product.memberPrice')}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-extrabold text-brand-700">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                        {t('detail.save', { percent: discount })}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            {!isMember && (
              <Link to="/login" className="text-sm text-orange-600 hover:underline mt-2 inline-block">
                {t('product.loginForMemberPrice')}
              </Link>
            )}

            {/* Description */}
            <p className="text-gray-600 mt-5 leading-relaxed">{product.description}</p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-3 hover:bg-gray-50 transition-colors"
                >
                  <FiMinus size={16} />
                </button>
                <span className="px-4 py-3 font-semibold text-center min-w-[48px]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-3 hover:bg-gray-50 transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              <button
                onClick={() => addItem(product, quantity)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all text-sm hover:-translate-y-0.5 shadow-lg shadow-brand-600/20"
              >
                <FiShoppingCart size={18} />
                {t('detail.addToCartPrice', { price: ((isMember ? memberPrice : product.price) * quantity).toFixed(2) })}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              {[
                { icon: FiTruck, text: t('detail.freeShipping'), sub: t('detail.over49') },
                { icon: FiShield, text: product.specs['Warranty'] || '10 Year', sub: t('detail.warranty') },
                { icon: FiRefreshCw, text: t('detail.thirtyDay'), sub: t('detail.freeReturns') },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="text-center">
                  <Icon className="mx-auto text-brand-600 mb-1" size={20} />
                  <p className="text-xs font-semibold text-gray-900">{text}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex gap-6 border-b border-gray-100">
                {(['features', 'specs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold transition-colors relative ${
                      activeTab === tab ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'features' ? t('detail.features') : t('detail.specifications')}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {activeTab === 'features' ? (
                  <ul className="space-y-2.5">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-900 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">{t('detail.youMayAlsoLike')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
