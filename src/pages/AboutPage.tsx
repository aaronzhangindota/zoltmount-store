import React from 'react'
import { FiTarget, FiGlobe, FiUsers, FiAward } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const AboutPage: React.FC = () => {
  const { t } = useTranslation()

  const stats = [
    { value: '500K+', label: t('about.statCustomers') },
    { value: '50+', label: t('about.statCountries') },
    { value: '4.8★', label: t('about.statRating') },
    { value: '10yr', label: t('about.statWarranty') },
  ]

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">{t('about.title')}</h1>
          <p className="text-gray-300 mt-4 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <p className="text-3xl font-extrabold text-brand-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <FiTarget className="text-brand-600" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{t('about.missionTitle')}</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">{t('about.missionText')}</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <FiAward className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{t('about.qualityTitle')}</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">{t('about.qualityText')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <FiGlobe className="text-purple-600" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{t('about.globalTitle')}</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">{t('about.globalText')}</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <FiUsers className="text-orange-600" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{t('about.customerTitle')}</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">{t('about.customerText')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
