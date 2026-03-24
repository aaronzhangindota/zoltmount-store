import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin, FiCheck } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { api } from '../../api/client'

export const Footer: React.FC = () => {
  const { t } = useTranslation()
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
  const [nlLoading, setNlLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!nlEmail.trim()) return
    setNlLoading(true)
    try {
      await api.subscribeNewsletter(nlEmail)
      setNlDone(true)
      setNlEmail('')
    } catch {
      setNlDone(true)
    } finally {
      setNlLoading(false)
    }
  }

  const productLinks = [
    t('footer.fixedMounts'),
    t('footer.tiltMounts'),
    t('footer.fullMotion'),
    t('footer.ceilingMounts'),
    t('footer.deskMounts'),
    t('footer.outdoorMounts'),
  ]

  const supportLinks = [
    { label: t('footer.installGuides'), to: '/install' },
    { label: t('footer.vesaCompat'), to: '/vesa' },
    { label: t('footer.warrantyPolicy'), to: '/warranty' },
    { label: t('footer.returnsRefunds'), to: '/returns' },
    { label: t('footer.faq'), to: '/faq' },
    { label: t('footer.contactUs'), to: '/contact' },
    { label: t('footer.bulkOrders'), to: '/b2b' },
  ]

  return (
    <footer className="bg-brand-950 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold">{t('footer.newsletter')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('footer.newsletterSub')}</p>
            </div>
            {nlDone ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <FiCheck size={18} />
                <span>{t('footer2.subscribed')}</span>
              </div>
            ) : (
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accent-500"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={nlLoading}
                  className="px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-500 text-white font-semibold rounded-r-lg transition-colors text-sm whitespace-nowrap"
                >
                  {nlLoading ? '...' : t('footer.subscribe')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Z</span>
              </div>
              <span className="text-xl font-bold text-white">ZoltMount</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.brandDesc')}
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: FiFacebook, label: 'Facebook' },
                { Icon: FiInstagram, label: 'Instagram' },
                { Icon: FiTwitter, label: 'Twitter' },
                { Icon: FiYoutube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <Link
                  key={label}
                  to="/contact"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.productsTitle')}</h4>
            <ul className="space-y-2.5">
              {productLinks.map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.supportTitle')}</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-gray-400 hover:text-white text-sm transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiMapPin className="mt-0.5 flex-shrink-0" size={16} />
                <span>{t('contact.officeDetail')}<br />{t('contact.officeSub')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiPhone size={16} className="flex-shrink-0" />
                <a href="https://wa.me/85261509207" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('contact.phoneDetail')}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMail size={16} className="flex-shrink-0" />
                <span>{t('contact.emailDetail')}</span>
              </li>
            </ul>

            {/* Payment icons */}
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">{t('footer.securePayment')}</p>
              <div className="flex gap-2">
                {['Visa', 'MC', 'Amex', 'PayPal'].map((p) => (
                  <span key={p} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">{t('footer.shippingPolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
