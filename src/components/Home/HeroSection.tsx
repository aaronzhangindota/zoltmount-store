import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiShield, FiTruck, FiAward } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const HeroSection: React.FC = () => {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 min-h-[85vh] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-200">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              {t('hero.title1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-yellow-300">
                {t('hero.title2')}
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-0.5"
              >
                {t('hero.shopAll')}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 text-sm border border-white/20"
              >
                {t('hero.bestSellers')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10">
              {[
                { icon: FiTruck, label: t('hero.freeShipping'), sub: t('hero.freeShippingSub') },
                { icon: FiShield, label: t('hero.lifetimeWarranty'), sub: t('hero.lifetimeWarrantySub') },
                { icon: FiAward, label: t('hero.dayReturns'), sub: t('hero.dayReturnsSub') },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center sm:text-left">
                  <Icon className="mx-auto sm:mx-0 text-accent-400 mb-2" size={22} />
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-gray-400 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Hero visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* TV mockup */}
              <div className="w-[480px] h-[320px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border-4 border-gray-700 flex items-center justify-center">
                <div className="w-[440px] h-[280px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded flex items-center justify-center">
                  <span className="text-7xl">📺</span>
                </div>
              </div>
              {/* Mount bracket */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-8 bg-gray-600 rounded-b-lg" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-500 rounded-b-lg" />

              {/* Floating badges */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-sm font-bold text-gray-900">4.9 ★</p>
                <p className="text-xs text-gray-500">{t('hero.rating')}</p>
              </div>
              <div className="absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-xl p-3 animate-bounce" style={{ animationDuration: '4s' }}>
                <p className="text-sm font-bold text-green-600">$29.99</p>
                <p className="text-xs text-gray-500">{t('hero.startingAt')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
