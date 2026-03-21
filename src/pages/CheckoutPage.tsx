import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiLock, FiArrowLeft, FiCheck, FiX, FiExternalLink } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '../store/cartStore'
import { useDataStore } from '../store/dataStore'
import { useUserStore } from '../store/userStore'
import { api } from '../api/client'
import { calculateShipping as calcShipping } from '../utils/shipping'

const CheckoutForm: React.FC<{ stripeLoadError?: string }> = ({ stripeLoadError = '' }) => {
  const { t } = useTranslation()
  const { items, subtotal, clearCart } = useCartStore()
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
  const [country, setCountry] = useState('US')

  const currentUser = useUserStore((s) => s.currentUser)
  const getDefaultAddress = useUserStore((s) => s.getDefaultAddress)
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

  const shippingZones = useDataStore((s) => s.shippingZones)
  const products = useDataStore((s) => s.products)

  const rawSubtotal = subtotal()
  const shipping = calcShipping(items, products, shippingZones, country)
  const pointsDiscountAmount = pointsToUse / 100
  const total = rawSubtotal - pointsDiscountAmount + shipping

  const maxPointsUsable = currentUser
    ? Math.min(currentUser.points, Math.floor(rawSubtotal * 100))
    : 0

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLDivElement>(null)

  const [placing, setPlacing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSimulating, setPaymentSimulating] = useState(false)
  const [paymentCountdown, setPaymentCountdown] = useState(0)
  const [paypalEmail, setPaypalEmail] = useState('')
  const [paypalEmailError, setPaypalEmailError] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing'>('input')
  const stripe = useStripe()
  const elements = useElements()
  const [stripeError, setStripeError] = useState('')

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
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // Scroll to the first error field
      setTimeout(() => {
        const firstErrorEl = formRef.current?.querySelector('.border-red-400') as HTMLElement
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          firstErrorEl.focus()
        }
      }, 50)
      return
    }
    setFormErrors({})

    // For third-party payments (non-credit-card), show payment simulation modal
    if (selectedMethod && selectedMethod.type !== 'credit_card') {
      setShowPaymentModal(true)
      return
    }

    // Credit card: use real Stripe payment
    if (stripe && elements) {
      setPlacing(true)
      setStripeError('')
      try {
        const { clientSecret } = await api.createPaymentIntent(total)
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email,
              address: { line1: address, city, state, postal_code: zip, country },
            },
          },
        })

        if (error) throw new Error(error.message)
        if (paymentIntent?.status === 'succeeded') {
          await executeOrder('processing')
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Payment failed'
        setStripeError(message)
        setPlacing(false)
      }
      return
    }
    // Stripe not loaded — cannot process card payment
    setStripeError('Payment system is still loading, please wait a moment and try again.')
    return
  }

  const executeOrder = async (orderStatus: string = 'pending') => {
    const orderId = `MP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    setOrderNumber(orderId)

    const earnedPoints = Math.floor(total / 100)

    setPlacing(true)
    try {
      await api.createOrder({
        id: orderId,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        status: orderStatus as 'pending' | 'processing',
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
      })

      // Handle points
      if (currentUser) {
        if (pointsToUse > 0) await usePoints(pointsToUse)
        if (earnedPoints > 0) await addPoints(earnedPoints, total)
      }

      setOrderPlaced(true)
      clearCart()
    } catch {
      // If API fails, still place order locally for UX
      setOrderPlaced(true)
      clearCart()
    } finally {
      setPlacing(false)
      setShowPaymentModal(false)
    }
  }

  // Handle "Confirm Payment" in the modal — validates input then processes
  const handleConfirmThirdPartyPayment = () => {
    // PayPal requires email
    if (selectedMethod?.type === 'paypal') {
      if (!paypalEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) {
        setPaypalEmailError(true)
        return
      }
    }

    // Start processing
    setPaymentStep('processing')
    setPaymentSimulating(true)
    setPaymentCountdown(3)
    const timer = setInterval(() => {
      setPaymentCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setPaymentSimulating(false)
          executeOrder()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCancelPayment = () => {
    setShowPaymentModal(false)
    setPaymentSimulating(false)
    setPaymentCountdown(0)
    setPaymentStep('input')
    setPaypalEmail('')
    setPaypalEmailError(false)
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
          <div className="lg:col-span-2 space-y-6" ref={formRef}>
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.contactInfo')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: false })) }} placeholder={t('checkout.email') + ' *'} className={`col-span-2 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setFormErrors((p) => ({ ...p, firstName: false })) }} placeholder={t('checkout.firstName') + ' *'} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setFormErrors((p) => ({ ...p, lastName: false })) }} placeholder={t('checkout.lastName') + ' *'} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.shippingAddress')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" value={address} onChange={(e) => { setAddress(e.target.value); setFormErrors((p) => ({ ...p, address: false })) }} placeholder={t('checkout.address') + ' *'} className={`col-span-2 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setFormErrors((p) => ({ ...p, city: false })) }} placeholder={t('checkout.city') + ' *'} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={state} onChange={(e) => { setState(e.target.value); setFormErrors((p) => ({ ...p, state: false })) }} placeholder={t('checkout.state') + ' *'} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.state ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <input type="text" value={zip} onChange={(e) => { setZip(e.target.value); setFormErrors((p) => ({ ...p, zip: false })) }} placeholder={t('checkout.zip') + ' *'} className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${formErrors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="AT">Austria</option>
                  <option value="CH">Switzerland</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="PT">Portugal</option>
                  <option value="IE">Ireland</option>
                  <option value="PL">Poland</option>
                  <option value="CZ">Czech Republic</option>
                  <option value="RO">Romania</option>
                  <option value="HU">Hungary</option>
                  <option value="GR">Greece</option>
                  <option value="RU">Russia</option>
                  <option value="UA">Ukraine</option>
                  <option value="BY">Belarus</option>
                  <option value="KZ">Kazakhstan</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                  <option value="TW">Taiwan</option>
                  <option value="HK">Hong Kong</option>
                  <option value="SG">Singapore</option>
                  <option value="MY">Malaysia</option>
                  <option value="TH">Thailand</option>
                  <option value="VN">Vietnam</option>
                  <option value="PH">Philippines</option>
                  <option value="ID">Indonesia</option>
                  <option value="IN">India</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="AE">UAE</option>
                  <option value="IL">Israel</option>
                  <option value="TR">Turkey</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                  <option value="ZA">South Africa</option>
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
                      {stripe ? (
                      <div>
                        <div className="px-4 py-3.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-transparent bg-white">
                          <CardElement options={{
                            style: {
                              base: { fontSize: '14px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
                              invalid: { color: '#ef4444' },
                            },
                          }} />
                        </div>
                        {stripeError && <p className="text-sm text-red-500 mt-2">{stripeError}</p>}
                      </div>
                    ) : stripeLoadError ? (
                      <div className="px-4 py-4 bg-red-50 border border-red-200 rounded-xl text-center">
                        <p className="text-sm text-red-600 font-medium">Payment system unavailable</p>
                        <p className="text-xs text-red-500 mt-1">{stripeLoadError}</p>
                        <p className="text-xs text-gray-400 mt-2">Please check Stripe configuration in admin settings, or choose another payment method.</p>
                      </div>
                    ) : (
                      <div className="px-4 py-6 bg-gray-50 rounded-xl text-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{t('common.loading')}</p>
                      </div>
                    )}
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

                {/* Points discount line */}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>{t('checkout.pointsDiscount')}</span>
                    <span>-${pointsDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>{t('checkout.shipping')}</span>
                  <span className={shipping === 0 && shippingZones.length === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 && shippingZones.length === 0
                      ? t('checkout.free')
                      : shipping === 0
                      ? t('checkout.free')
                      : `$${shipping.toFixed(2)}`}
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
                disabled={placing || (selectedMethod?.type === 'credit_card' && !stripe)}
                className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand-600/20"
              >
                <FiLock size={16} />
                {placing ? t('common.loading') : t('checkout.placeOrder', { total: total.toFixed(2) })}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                {t('checkout.securePayment')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Third-party payment modal */}
      {showPaymentModal && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${
              selectedMethod.type === 'paypal' ? 'bg-[#003087]' :
              selectedMethod.type === 'alipay' ? 'bg-[#1677FF]' :
              selectedMethod.type === 'wechat' ? 'bg-[#07C160]' :
              'bg-gray-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <span className="text-white font-bold text-lg">
                  {t('checkout.paymentMethod_' + selectedMethod.type)}
                </span>
              </div>
              {!paymentSimulating && (
                <button onClick={handleCancelPayment} className="text-white/70 hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {paymentStep === 'processing' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-900">
                    {t('checkout.processingPayment', 'Processing payment...')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('checkout.redirectingIn', 'Completing in {{seconds}}s...').replace('{{seconds}}', String(paymentCountdown))}
                  </p>
                </div>
              ) : (
                <>
                  {/* Amount display */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">{t('checkout.paymentAmount', 'Payment Amount')}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">${total.toFixed(2)}</p>
                  </div>

                  {/* PayPal: email input */}
                  {selectedMethod.type === 'paypal' && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-3">
                          {t('checkout.paypalLoginPrompt', 'Log in to your PayPal account to complete the payment.')}
                        </p>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">PayPal Email *</label>
                          <input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => { setPaypalEmail(e.target.value); setPaypalEmailError(false) }}
                            placeholder="your@email.com"
                            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${paypalEmailError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                          />
                          {paypalEmailError && (
                            <p className="text-xs text-red-500 mt-1">{t('checkout.paypalEmailRequired', 'Please enter a valid PayPal email address.')}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {t('checkout.paypalNote', 'In production, you will be redirected to PayPal to authorize this payment.')}
                      </p>
                    </div>
                  )}

                  {/* Alipay: scan prompt */}
                  {selectedMethod.type === 'alipay' && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-xl p-6 text-center">
                        <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-blue-200">
                          <span className="text-5xl">💰</span>
                        </div>
                        <p className="text-sm text-gray-600">{t('checkout.alipayPrompt', 'Scan with Alipay to complete payment')}</p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {t('checkout.alipayNote', 'In production, a real Alipay QR code will be displayed here.')}
                      </p>
                    </div>
                  )}

                  {/* WeChat: QR prompt */}
                  {selectedMethod.type === 'wechat' && (
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-xl p-6 text-center">
                        <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-green-200">
                          <span className="text-5xl">💬</span>
                        </div>
                        <p className="text-sm text-gray-600">{t('checkout.wechatPrompt', 'Scan with WeChat to complete payment')}</p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {t('checkout.wechatNote', 'In production, a real WeChat Pay QR code will be displayed here.')}
                      </p>
                    </div>
                  )}

                  {/* Bank transfer: details */}
                  {selectedMethod.type === 'bank_transfer' && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <p className="font-medium text-gray-900">{t('checkout.bankDetails', 'Bank Transfer Details')}</p>
                        <div className="space-y-1 text-gray-600">
                          <p>Bank: HSBC Hong Kong</p>
                          <p>Account: ZoltMount Trading Ltd</p>
                          <p>Account #: **** **** 8821</p>
                          <p>SWIFT: HSBCHKHH</p>
                          <p className="text-xs text-orange-600 mt-2">
                            {t('checkout.bankRef', 'Please include your order reference in the transfer memo.')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {t('checkout.bankNote', 'Click below after you have completed the bank transfer.')}
                      </p>
                    </div>
                  )}

                  {/* Other payment */}
                  {selectedMethod.type === 'other' && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-4xl mb-3">{selectedMethod.icon}</p>
                      <p className="text-sm text-gray-600">
                        {t('checkout.otherPrompt', 'Follow the payment provider instructions to complete your payment.')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            {paymentStep === 'input' && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleCancelPayment}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmThirdPartyPayment}
                  className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors text-sm ${
                    selectedMethod.type === 'paypal' ? 'bg-[#003087] hover:bg-[#001f5c]' :
                    selectedMethod.type === 'alipay' ? 'bg-[#1677FF] hover:bg-[#0d5bdb]' :
                    selectedMethod.type === 'wechat' ? 'bg-[#07C160] hover:bg-[#06a050]' :
                    'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {selectedMethod.type === 'paypal'
                    ? t('checkout.payWithPaypal', 'Pay with PayPal')
                    : selectedMethod.type === 'alipay'
                    ? t('checkout.payWithAlipay', 'I\'ve Paid via Alipay')
                    : selectedMethod.type === 'wechat'
                    ? t('checkout.payWithWechat', 'I\'ve Paid via WeChat')
                    : selectedMethod.type === 'bank_transfer'
                    ? t('checkout.confirmTransfer', 'I\'ve Completed Transfer')
                    : t('checkout.confirmPayment', 'Confirm Payment')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const CheckoutPage: React.FC = () => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [stripeLoadError, setStripeLoadError] = useState('')

  useEffect(() => {
    api.getStripeConfig()
      .then(({ publishableKey }) => {
        if (!publishableKey) {
          setStripeLoadError('Stripe publishable key is empty')
          return
        }
        const promise = loadStripe(publishableKey)
        promise.then((stripe) => {
          if (!stripe) {
            setStripeLoadError('Failed to initialize Stripe. Please check your publishable key.')
          }
        })
        setStripePromise(promise)
      })
      .catch((err) => {
        console.error('Stripe config error:', err)
        setStripeLoadError(err instanceof Error ? err.message : 'Failed to load Stripe configuration')
      })
  }, [])

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm stripeLoadError={stripeLoadError} />
    </Elements>
  )
}
