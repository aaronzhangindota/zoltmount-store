import React from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  const productLinks = [
    t('footer.fixedMounts'),
    t('footer.tiltMounts'),
    t('footer.fullMotion'),
    t('footer.ceilingMounts'),
    t('footer.deskMounts'),
    t('footer.outdoorMounts'),
  ]

  const supportLinks = [
    t('footer.installGuides'),
    t('footer.vesaCompat'),
    t('footer.warrantyPolicy'),
    t('footer.returnsRefunds'),
    t('footer.faq'),
    t('footer.contactUs'),
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
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accent-500"
              />
              <button className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-r-lg transition-colors text-sm whitespace-nowrap">
                {t('footer.subscribe')}
              </button>
            </div>
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
              {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
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
                <li key={item}>
                  <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</Link>
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
                <span>1234 Industrial Ave, Suite 200<br />Shenzhen, GD 518000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiPhone size={16} className="flex-shrink-0" />
                <span>+1 (888) 555-ZOLT</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMail size={16} className="flex-shrink-0" />
                <span>support@zoltmount.com</span>
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
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.shippingPolicy')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
