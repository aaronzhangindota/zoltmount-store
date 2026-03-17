import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const CTABanner: React.FC = () => {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-gradient-to-r from-brand-600 to-brand-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          {t('cta.title')}
        </h2>
        <p className="text-blue-100 mt-4 text-lg max-w-2xl mx-auto">
          {t('cta.subtitle')} <span className="font-bold text-accent-400">ZOLT15</span> {t('cta.subtitleEnd')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
          >
            {t('cta.shopNow')}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
          >
            {t('cta.needHelp')}
          </Link>
        </div>
      </div>
    </section>
  )
}
