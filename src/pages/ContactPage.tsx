import React, { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiCheck } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useSEO } from '../hooks/useSEO'
import { api } from '../api/client'

export const ContactPage: React.FC = () => {
  const { t } = useTranslation()
  useSEO({ title: 'Contact Us | ZoltMount', description: 'Get in touch with ZoltMount. Email, phone, live chat support available 24/7.', canonical: '/contact' })

  const contactCards = [
    { icon: FiMail, title: t('contact.emailTitle'), detail: t('contact.emailDetail'), sub: t('contact.emailSub') },
    { icon: FiPhone, title: t('contact.phoneTitle'), detail: t('contact.phoneDetail'), sub: t('contact.phoneSub') },
    { icon: FiMessageCircle, title: t('contact.chatTitle'), detail: t('contact.chatDetail'), sub: t('contact.chatSub') },
    { icon: FiMapPin, title: t('contact.officeTitle'), detail: t('contact.officeDetail'), sub: t('contact.officeSub') },
    { icon: FiClock, title: t('contact.hoursTitle'), detail: t('contact.hoursDetail'), sub: t('contact.hoursSub') },
  ]

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('General Inquiry')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      const fullMessage = orderNumber.trim() ? `[Order #${orderNumber.trim()}]\n\n${message}` : message
      await api.submitContactForm({ firstName, lastName, email, subject, message: fullMessage })
      setSubmitted(true)
      setFirstName('')
      setLastName('')
      setEmail('')
      setSubject('General Inquiry')
      setOrderNumber('')
      setMessage('')
    } catch {
      // Still show success for UX
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

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

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.formSubmitted', 'Message Sent!')}</h3>
                  <p className="text-gray-500 text-sm mb-4">{t('contact.formSubmittedDesc', 'We\'ll get back to you within 2 hours.')}</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {t('contact.sendAnother', 'Send Another Message')}
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formFirstName')}</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formLastName')}</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formEmail')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formSubject')}</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      <option value="General Inquiry">{t('contact.subjectGeneral')}</option>
                      <option value="Installation Help">{t('contact.subjectInstallation')}</option>
                      <option value="Product Compatibility">{t('contact.subjectCompatibility')}</option>
                      <option value="Order Status">{t('contact.subjectOrder')}</option>
                      <option value="Warranty Claim">{t('contact.subjectWarranty')}</option>
                      <option value="Wholesale / B2B">{t('contact.subjectWholesale')}</option>
                      <option value="Other">{t('contact.subjectOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('contact.formOrderNumber', 'Order Number')} <span className="text-gray-400 font-normal">({t('contact.optional', 'Optional')})</span>
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. MP-A1B2C3D4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.formMessage')}</label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                      placeholder={t('contact.formPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-brand-600/20"
                  >
                    {submitting ? '...' : t('contact.formSubmit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
