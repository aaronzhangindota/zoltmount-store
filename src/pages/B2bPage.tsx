import React, { useState } from 'react'
import { FiCheck, FiMail, FiMessageCircle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useSEO } from '../hooks/useSEO'
import { api } from '../api/client'

export const B2bPage: React.FC = () => {
  const { t } = useTranslation()
  useSEO({ title: 'B2B Solutions & Bulk Orders | ZoltMount', description: 'Factory-direct TV mounting solutions for businesses. Volume pricing, OEM/ODM customization, global logistics.', canonical: '/b2b' })

  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [projectSize, setProjectSize] = useState('1-50')
  const [industry, setIndustry] = useState('Corporate')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !email.trim()) return
    setSubmitting(true)
    try {
      const fullMessage = `[B2B Inquiry]\nCompany: ${companyName}\nProject Size: ${projectSize} units\nIndustry: ${industry}\n\n${message}`
      await api.submitContactForm({ firstName: companyName, lastName: '', email, subject: 'B2B Inquiry', message: fullMessage })
      setSubmitted(true)
      setCompanyName('')
      setEmail('')
      setProjectSize('1-50')
      setIndustry('Corporate')
      setMessage('')
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const advantages = [
    { title: t('b2b.factoryTitle'), desc: t('b2b.factoryDesc'), icon: '🏭' },
    { title: t('b2b.customTitle'), desc: t('b2b.customDesc'), icon: '🔧' },
    { title: t('b2b.logisticsTitle'), desc: t('b2b.logisticsDesc'), icon: '🌍' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900">{t('b2b.title')}</h1>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-lg">
            {t('b2b.subtitle')}
          </p>
        </div>

        {/* 3 Advantage Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {advantages.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Inquiry Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('b2b.formTitle')}</h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-green-600" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('b2b.successTitle')}</h3>
                <p className="text-gray-500 text-sm mb-4">{t('b2b.successDesc')}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {t('b2b.sendAnother')}
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('b2b.companyName')} *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('b2b.contactEmail')} *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('b2b.projectSize')}</label>
                    <select
                      value={projectSize}
                      onChange={(e) => setProjectSize(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      <option value="1-50">1 – 50 {t('b2b.units')}</option>
                      <option value="51-200">51 – 200 {t('b2b.units')}</option>
                      <option value="201-500">201 – 500 {t('b2b.units')}</option>
                      <option value="500+">500+ {t('b2b.units')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('b2b.industry')}</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      <option value="Education">{t('b2b.industryEducation')}</option>
                      <option value="Healthcare">{t('b2b.industryHealthcare')}</option>
                      <option value="Corporate">{t('b2b.industryCorporate')}</option>
                      <option value="Hospitality">{t('b2b.industryHospitality')}</option>
                      <option value="Government">{t('b2b.industryGovernment')}</option>
                      <option value="Other">{t('b2b.industryOther')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('b2b.message')}</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                    placeholder={t('b2b.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-brand-600/20"
                >
                  {submitting ? '...' : t('b2b.submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-3">{t('b2b.ctaText')}</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a href="mailto:support@zoltmount.com" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors">
              <FiMail size={16} /> support@zoltmount.com
            </a>
            <a href="https://wa.me/85261509207" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors">
              <FiMessageCircle size={16} /> WhatsApp: +852 6150 9207
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
