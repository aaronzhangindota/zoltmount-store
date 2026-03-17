import React from 'react'
import { FiStar } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const reviews = [
  {
    name: 'James Wilson',
    location: 'Austin, TX',
    rating: 5,
    text: 'The ArcMotion full motion mount is incredible. Super easy to install and the smooth swivel motion is perfect for my corner setup. Holds my 65" LG without any issues.',
    product: 'ArcMotion Full Motion',
    verified: true,
  },
  {
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'I ordered 3 ProGrip fixed mounts for different rooms. The slim profile looks amazing — you can barely see the mount behind the TV. Great value for the price.',
    product: 'ProGrip Fixed Mount',
    verified: true,
  },
  {
    name: 'Michael Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    text: 'As a professional installer, I recommend ZoltMount to all my clients. The build quality is on par with mounts twice the price. Lifetime warranty is the cherry on top.',
    product: 'ArcMotion Pro Large',
    verified: true,
  },
  {
    name: 'Emily Thompson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'The DeskFlex dual monitor arm transformed my home office. Cable management is clean, and the gas spring makes repositioning effortless. Wish I bought this sooner!',
    product: 'DeskFlex Dual Monitor',
    verified: true,
  },
]

export const Testimonials: React.FC = () => {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-accent-400 font-semibold text-sm uppercase tracking-wider">{t('testimonials.sectionLabel')}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            {t('testimonials.title')}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar key={s} size={18} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-white font-bold">4.8</span>
            <span className="text-gray-400">{t('testimonials.basedOn')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    size={14}
                    className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{review.product}</p>
                  {review.verified && (
                    <span className="text-xs text-green-400 font-medium">✓ {t('testimonials.verifiedPurchase')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
