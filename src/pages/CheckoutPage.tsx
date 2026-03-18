import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../store/cartStore'
import { useAdminStore } from '../store/adminStore'
import { useDataStore } from '../store/dataStore'
import { useUserStore } from '../store/userStore'

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation()
  const { items, subtotal, clearCart } = useCartStore()
  const addOrder = useAdminStore((s) => s.addOrder)
  const paymentMethods = useDataStore((s) => s.paymentMethods)
  const enabledMethods = paymentMethods
    .filter((m) => m.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const [selectedPayment, setSelectedPayment] = useState<string>(enabledMethods[0]?.id ?? '')
  const selectedMethod = enabledMethods.find((m) => m.id === selectedPayment)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  const currentUser = useUserStore((s) => s.currentUser)
  const getDefaultAddress = useUserStore((s) => s.getDefaultAddress)
  const getMemberDiscount = useUserStore((s) => s.getMemberDiscount)
  const addPoints = useUserStore((s) => s.addPoints)
  const usePoints = useUserStore((s) => s.usePoints)

  const [pointsToUse, setPointsToUse] = useState(0)

  // Auto-fill for logged-in users
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email)
      setFirstName(currentUser.firstName)
      setLastName(currentUser.lastName)
      const defaultAddr = getDefaultAddress()
      if (defaultAddr) {
        setAddress(defaultAddr.address)
        setCity(defaultAddr.city)
        setState(defaultAddr.state)
        setZip(defaultAddr.zip)
      }
    }
  }, [currentUser])

  const rawSubtotal = subtotal()
  const shipping = rawSubtotal >= 49 ? 0 : 9.99
  const discountRate = getMemberDiscount()
  const memberDiscountAmount = currentUser ? rawSubtotal * (1 - discountRate) : 0
  const pointsDiscountAmount = pointsToUse / 100
  const total = rawSubtotal - memberDiscountAmount - pointsDiscountAmount + shipping

  const maxPointsUsable = currentUser
    ? Math.min(currentUser.points, Math.floor((rawSubtotal - memberDiscountAmount) * 100))
    : 0

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})

  const [placing, setPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    // Validate required fields
    const errors: Record<string, boolean> = {}
    if (!email.trim()) errors.email = true
    if (!firstName.trim()) errors.firstName = true
    if (!lastName.trim()) errors.lastName = true
    if (!address.trim()) errors.address = true
    if (!city.trim()) errors.city = true
    if (!state.trim()) errors.state = true
    if (!zip.trim()) errors.zip = true
    if (!selectedPayment) errors.payment = true
    // Validate credit card fields when credit card is selected
    if (selectedMethod?.type === 'credit_card') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 13) errors.cardNumber = true
      if (!cardExpiry.trim() || !/^\d{2}\s*\/\s*\d{2}$/.test(cardExpiry.trim())) errors.cardExpiry = true
      if (!cardCvc.trim() || cardCvc.trim().length < 3) errors.cardCvc = true
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setFormErrors({})

    const orderId = `MP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    setOrderNumber(orderId)

    const earnedPoints = Math.floor(total)

    setPlacing(true)
    try {
      await addOrder({
        id: orderId,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        status: 'pending',
        customer: {
          email: email || 'guest@example.com',
          firstName: firstName || 'Guest',
          lastName: lastName || '',
        },
        shippingAddress: {
          address: address || '',
          city: city || '',
          state: state || '',
          zip: zip || '',
        },
        createdAt: new Date().toISOString(),
        userId: currentUser?.id,
        pointsEarned: currentUser ? earnedPoints : undefined,
        pointsUsed: pointsToUse > 0 ? pointsToUse : undefined,
        discount: memberDiscountAmount > 0 ? memberDiscountAmount : undefined,
      })

      // Handle points
      if (currentUser) {
        if (pointsToUse > 0) usePoints(pointsToUse)
        if (earnedPoints > 0) addPoints(earnedPoints)
      }

      setOrderPlaced(true)
      clearCart()
    } catch {
      // If API fails, still place order locally for UX
      setOrderPlaced(true)
      clearCart()
    } finally {
      setPlacing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-600" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('checkout.orderConfirmed')}</h1>
          <p className="text-gray-500 mt-3">{t('checkout.orderThankYou')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('checkout.orderNumber', { number: orderNumber })}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {t('checkout.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('checkout.emptyCart')}</h1>
        <Link to="/products" className="text-brand-600 hover:underline mt-4 block">{t('checkout.browseProducts')}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <FiArrowLeft size={16} /> {t('checkout.backToShopping')}
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('checkout.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.contactInfo')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: false })) }} placeholder={t('checkout.email')} className={`col-span-2 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setFormErrors((p) => ({ ...p, firstName: false })) }} placeholder={t('checkout.firstName')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setFormErrors((p) => ({ ...p, lastName: false })) }} placeholder={t('checkout.lastName')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.shippingAddress')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" value={address} onChange={(e) => { setAddress(e.target.value); setFormErrors((p) => ({ ...p, address: false })) }} placeholder={t('checkout.address')} className={`col-span-2 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setFormErrors((p) => ({ ...p, city: false })) }} placeholder={t('checkout.city')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={state} onChange={(e) => { setState(e.target.value); setFormErrors((p) => ({ ...p, state: false })) }} placeholder={t('checkout.state')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.state ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={zip} onChange={(e) => { setZip(e.target.value); setFormErrors((p) => ({ ...p, zip: false })) }} placeholder={t('checkout.zip')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <select className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
                <input type="tel" placeholder={t('checkout.phone')} className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
            </div>

            {/* Payment method selection */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiLock size={18} className="text-green-600" /> {t('checkout.payment')}
              </h2>

              {enabledMethods.length === 0 ? (
                <p className="text-sm text-gray-400">{t('checkout.noPaymentMethods', 'No payment methods available.')}</p>
              ) : (
                <div className="space-y-4">
                  {/* Payment method tabs */}
                  <div className="flex flex-wrap gap-2">
                    {enabledMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedPayment === method.id
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{method.icon}</span>
                        {t('checkout.paymentMethod_' + method.type)}
                      </button>
                    ))}
                  </div>

                  {/* Credit card form */}
                  {selectedMethod?.type === 'credit_card' && (
                    <div className="space-y-4 pt-2">
                      {selectedMethod.supportedCards.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {selectedMethod.supportedCards.map((card) => (
                            <span key={card} className="px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-500 font-medium">{card}</span>
                          ))}
                        </div>
                      )}
                      <input type="text" value={cardNumber} onChange={(e) => { setCardNumber(e.target.value); setFormErrors((p) => ({ ...p, cardNumber: false })) }} placeholder={t('checkout.cardNumber')} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={cardExpiry} onChange={(e) => { setCardExpiry(e.target.value); setFormErrors((p) => ({ ...p, cardExpiry: false })) }} placeholder={t('checkout.expiry')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.cardExpiry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                        <input type="text" value={cardCvc} onChange={(e) => { setCardCvc(e.target.value); setFormErrors((p) => ({ ...p, cardCvc: false })) }} placeholder={t('checkout.cvc')} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.cardCvc ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      </div>
                    </div>
                  )}

                  {/* PayPal */}
                  {selectedMethod?.type === 'paypal' && (
                    <div className="bg-blue-50 rounded-xl p-4 text-center space-y-2 pt-2">
                      <p className="text-2xl">🅿️</p>
                      <p className="text-sm text-gray-700">{t('checkout.paypalRedirect', 'You will be redirected to PayPal to complete your payment after placing the order.')}</p>
                    </div>
                  )}

                  {/* Alipay */}
                  {selectedMethod?.type === 'alipay' && (
                    <div className="bg-blue-50 rounded-xl p-4 text-center space-y-2 pt-2">
                      <p className="text-2xl">💰</p>
                      <p className="text-sm text-gray-700">{t('checkout.alipayRedirect', 'You will be redirected to Alipay to complete your payment after placing the order.')}</p>
                    </div>
                  )}

                  {/* WeChat Pay */}
                  {selectedMethod?.type === 'wechat' && (
                    <div className="bg-green-50 rounded-xl p-4 text-center space-y-2 pt-2">
                      <p className="text-2xl">💬</p>
                      <p className="text-sm text-gray-700">{t('checkout.wechatRedirect', 'A WeChat Pay QR code will be generated after placing the order.')}</p>
                    </div>
                  )}

                  {/* Bank transfer */}
                  {selectedMethod?.type === 'bank_transfer' && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2 pt-2">
                      <p className="text-2xl">🏦</p>
                      <p className="text-sm text-gray-700">{t('checkout.bankTransferInfo', 'Bank transfer details will be provided after placing the order.')}</p>
                    </div>
                  )}

                  {/* Other */}
                  {selectedMethod?.type === 'other' && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2 pt-2">
                      <p className="text-2xl">{selectedMethod.icon}</p>
                      <p className="text-sm text-gray-700">{t('checkout.otherPaymentInfo', 'Payment instructions will be provided after placing the order.')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📺</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{t('checkout.qty', { count: item.quantity })}</p>
                    </div>
                    <span className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-5">
                <input type="text" placeholder={t('checkout.promoCode')} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors">{t('checkout.apply')}</button>
              </div>

              {/* Points redemption */}
              {currentUser && currentUser.points > 0 && (
                <div className="mb-5 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs text-orange-700 font-medium mb-2">
                    {t('checkout.pointsAvailable', { points: currentUser.points, value: (currentUser.points / 100).toFixed(2) })}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={maxPointsUsable}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Math.min(maxPointsUsable, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder={t('checkout.pointsToUse')}
                      className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button
                      onClick={() => setPointsToUse(maxPointsUsable)}
                      className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      {t('checkout.useAllPoints')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-500">
                  <span>{t('checkout.subtotal')}</span>
                  <span>${rawSubtotal.toFixed(2)}</span>
                </div>

                {/* Member discount line */}
                {currentUser && memberDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('checkout.memberDiscount')}</span>
                    <span>-${memberDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Points discount line */}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>{t('checkout.pointsDiscount')}</span>
                    <span>-${pointsDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>{t('checkout.shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? t('checkout.free') : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('checkout.tax')}</span>
                  <span>{t('checkout.taxCalc')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>{t('checkout.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand-600/20"
              >
                <FiLock size={16} />
                {t('checkout.placeOrder', { total: total.toFixed(2) })}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                {t('checkout.securePayment')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
