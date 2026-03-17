import React from 'react'
import { FiShield, FiTool, FiZap, FiHeadphones, FiPackage, FiRefreshCw } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const WhyChooseUs: React.FC = () => {
  const { t } = useTranslation()

  const features = [
    { icon: FiShield, titleKey: 'why.premiumQuality', descKey: 'why.premiumQualityDesc', color: 'bg-blue-50 text-blue-600' },
    { icon: FiTool, titleKey: 'why.easyInstall', descKey: 'why.easyInstallDesc', color: 'bg-green-50 text-green-600' },
    { icon: FiZap, titleKey: 'why.universalFit', descKey: 'why.universalFitDesc', color: 'bg-yellow-50 text-yellow-600' },
    { icon: FiHeadphones, titleKey: 'why.support247', descKey: 'why.support247Desc', color: 'bg-purple-50 text-purple-600' },
    { icon: FiPackage, titleKey: 'why.freeShipping', descKey: 'why.freeShippingDesc', color: 'bg-orange-50 text-orange-600' },
    { icon: FiRefreshCw, titleKey: 'why.returns', descKey: 'why.returnsDesc', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">{t('why.sectionLabel')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            {t('why.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div
              key={feat.titleKey}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feat.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t(feat.titleKey)}</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{t(feat.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
