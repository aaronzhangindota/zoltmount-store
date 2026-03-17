import React from 'react'
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

export const ContactPage: React.FC = () => {
  const { t } = useTranslation()

  const contactCards = [
    { icon: FiMail, title: t('contact.emailTitle'), detail: t('contact.emailDetail'), sub: t('contact.emailSub') },
    { icon: FiPhone, title: t('contact.phoneTitle'), detail: t('contact.phoneDetail'), sub: t('contact.phoneSub') },
    { icon: FiMessageCircle, title: t('contact.chatTitle'), detail: t('contact.chatDetail'), sub: t('contact.chatSub') },
    { icon: FiMapPin, title: t('contact.officeTitle'), detail: t('contact.officeDetail'), sub: t('contact.officeSub') },
    { icon: FiClock, title: t('contact.hoursTitle'), detail: t('contact.hoursDetail'), sub: t('contact.hoursSub') },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">{t('contact.title')}</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact info cards */}
          <div className="space-y-4">
            {contactCards.map(({ icon: Icon, title, detail, sub }) => (
              <div key={title} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-brand-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <p className="text-gray-700 text-sm">{detail}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('contact.formTitle')}</h2>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formFirstName')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formLastName')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formEmail')}</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formSubject')}</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300">
                    <option>{t('contact.subjectGeneral')}</option>
                    <option>{t('contact.subjectInstallation')}</option>
                    <option>{t('contact.subjectCompatibility')}</option>
                    <option>{t('contact.subjectOrder')}</option>
                    <option>{t('contact.subjectWarranty')}</option>
                    <option>{t('contact.subjectWholesale')}</option>
                    <option>{t('contact.subjectOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formMessage')}</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                    placeholder={t('contact.formPlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-brand-600/20"
                >
                  {t('contact.formSubmit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
