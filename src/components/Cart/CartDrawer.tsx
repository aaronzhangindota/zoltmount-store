import React from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/cartStore'

export const CartDrawer: React.FC = () => {
  const { t } = useTranslation()
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCartStore()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiShoppingBag size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">{t('cart.title')}</h2>
            <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems()}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FiShoppingBag size={48} className="mb-4" />
              <p className="text-lg font-medium">{t('cart.empty')}</p>
              <p className="text-sm mt-1">{t('cart.emptyHint')}</p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📺</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-brand-600 font-bold mt-0.5">
                      ${item.product.price.toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('cart.subtotal')}</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('cart.shipping')}</span>
                <span className="text-green-600 font-medium">
                  {subtotal() >= 49 ? t('cart.free') : '$9.99'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>{t('cart.total')}</span>
                <span>
                  ${(subtotal() + (subtotal() >= 49 ? 0 : 9.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-center font-semibold rounded-xl transition-colors text-sm"
            >
              {t('cart.checkout')}
            </Link>
            <button
              onClick={closeCart}
              className="block w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors text-center"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
