import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

const faqData: FaqCategory[] = [
  {
    title: 'Orders & Shipping',
    items: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 7-12 business days within the US. International orders may take 10-20 business days depending on the destination.',
      },
      {
        q: 'How much does shipping cost?',
        a: 'We offer free standard shipping on all orders over $49 within the continental US. For orders under $49, a flat rate of $5.99 applies. International shipping rates are calculated at checkout based on destination and package weight.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive an email with a tracking number and a link to track your package. You can also log in to your account and view tracking information under "My Orders".',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes! We ship to over 50 countries worldwide. International shipping costs and delivery times vary by destination. Customs duties and import taxes may apply and are the responsibility of the buyer.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'Orders can be modified or cancelled within 2 hours of placement. After that, we begin processing and may not be able to make changes. Please contact us at support@zoltmount.com as soon as possible if you need to modify your order.',
      },
    ],
  },
  {
    title: 'Installation',
    items: [
      {
        q: 'What tools do I need to install a TV mount?',
        a: 'You will typically need a power drill, drill bits, a level, a pencil, a tape measure, a stud finder, and a Phillips screwdriver. Most mounting hardware is included with your ZoltMount product. Check our Installation Guides page for detailed tool lists.',
      },
      {
        q: 'Can I install a TV mount by myself?',
        a: 'For TVs under 40 inches, a single person can usually manage the installation. For larger TVs, we strongly recommend having a second person help lift and position the TV. Full-motion mounts with heavier TVs should always be a two-person job.',
      },
      {
        q: 'Can I mount a TV on drywall without studs?',
        a: 'It is not recommended for TVs over 30 lbs. If studs are not available, you can use heavy-duty toggle bolts rated for your TV\'s weight, but only for lighter TVs and monitors. For larger TVs, consider using a plywood backing panel secured to studs.',
      },
      {
        q: 'How do I find studs in my wall?',
        a: 'Use an electronic stud finder — simply slide it along the wall and it will indicate when it detects a stud. Studs are typically spaced 16 inches apart. You can also knock on the wall and listen for a solid (non-hollow) sound.',
      },
      {
        q: 'How high should I mount my TV?',
        a: 'The center of the screen should be at eye level when seated. For most living rooms, this means the center of the TV is about 42-48 inches from the floor. If mounting above a fireplace, a tilt mount is recommended to angle the screen downward.',
      },
    ],
  },
  {
    title: 'Product Compatibility',
    items: [
      {
        q: 'What is a VESA pattern?',
        a: 'VESA (Video Electronics Standards Association) defines the standard spacing for mounting holes on the back of TVs and monitors. It is measured in millimeters (e.g., 200x200mm). Check our VESA Compatibility Guide for more details.',
      },
      {
        q: 'How do I know if a mount is compatible with my TV?',
        a: 'Check two things: (1) Your TV\'s VESA pattern matches the mount\'s supported range, and (2) Your TV\'s weight does not exceed the mount\'s maximum weight capacity. Both specifications are listed on every ZoltMount product page.',
      },
      {
        q: 'What is the maximum TV weight your mounts support?',
        a: 'It depends on the model. Our fixed mounts support up to 130 lbs, tilt mounts up to 120 lbs, and full-motion mounts up to 150 lbs. Always check the specific product listing for exact weight limits.',
      },
      {
        q: 'Do your mounts work with curved TVs?',
        a: 'Yes, all ZoltMount products are compatible with curved TVs as long as the TV has a standard VESA mounting pattern. The mounting brackets attach to the VESA holes on the back of the TV, which are the same on both flat and curved models.',
      },
      {
        q: 'What VESA sizes do you support?',
        a: 'Our product range covers VESA patterns from 75x75mm up to 600x400mm, accommodating TVs from 13 inches to 90 inches. Check the product specifications for the exact VESA range of each model.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy from the date of delivery. Products must be in original, unopened packaging with all parts included. Visit our Returns & Refunds page for full details.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Email us at support@zoltmount.com with your order number and reason for return. We will issue an RMA (Return Merchandise Authorization) number within 1 business day. Ship the product back with the RMA number written on the box.',
      },
      {
        q: 'How long does it take to receive my refund?',
        a: 'After we receive and inspect your return, refunds are processed within 7 business days to your original payment method. Please allow an additional 5-10 business days for the refund to appear on your statement.',
      },
      {
        q: 'What if my product arrives damaged?',
        a: 'Contact us within 48 hours of delivery with photos of the damage and your order number. We will send a free replacement or missing parts at no charge, including shipping.',
      },
    ],
  },
  {
    title: 'Account & Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Visa, Mastercard, American Express, and PayPal. All transactions are securely processed with SSL encryption to protect your payment information.',
      },
      {
        q: 'How does the points program work?',
        a: 'Registered members earn 1 point for every $100 spent on qualifying purchases. Points are automatically credited to your account after your order is delivered. You can view your point balance in your account dashboard.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Login" at the top of the page, then click "Forgot Password". Enter the email address associated with your account and we will send you a password reset link.',
      },
      {
        q: 'Is my personal information secure?',
        a: 'Absolutely. We use industry-standard SSL encryption for all data transmission and never store your full credit card information. Please review our Privacy Policy for complete details on how we protect your data.',
      },
    ],
  },
]

const AccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
    >
      <span className="font-medium text-gray-900 text-sm pr-4">{item.q}</span>
      {isOpen ? (
        <FiChevronUp className="text-gray-400 flex-shrink-0" size={18} />
      ) : (
        <FiChevronDown className="text-gray-400 flex-shrink-0" size={18} />
      )}
    </button>
    {isOpen && (
      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
        {item.a}
      </div>
    )}
  </div>
)

export const FaqPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
          <p className="text-gray-300 mt-3 text-sm">Find quick answers to common questions about our products and services</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-10">
          {faqData.map((category) => (
            <div key={category.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h2>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const key = `${category.title}-${item.q}`
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Still Have Questions?</h3>
          <p className="text-gray-600 text-sm mb-4">Can't find what you're looking for? Our support team is happy to help.</p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors no-underline"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
