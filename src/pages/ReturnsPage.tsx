import React from 'react'
import { Link } from 'react-router-dom'
import { FiRotateCcw, FiCheck, FiX, FiClock, FiPackage, FiDollarSign } from 'react-icons/fi'
import { useSEO } from '../hooks/useSEO'

export const ReturnsPage: React.FC = () => {
  useSEO({ title: 'Returns & Refunds | ZoltMount', description: '30-day no-questions-asked return policy. Easy returns and full refunds on all ZoltMount products.', canonical: '/returns' })
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Returns & Refunds</h1>
          <p className="text-gray-300 mt-3 text-sm">Hassle-free returns within 30 days of delivery</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <FiClock className="mx-auto text-brand-600 mb-2" size={28} />
            <div className="text-2xl font-extrabold text-brand-600">30 Days</div>
            <p className="text-gray-600 text-sm m-0 mt-1">Return window</p>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <FiPackage className="mx-auto text-brand-600 mb-2" size={28} />
            <div className="text-2xl font-extrabold text-brand-600">Free</div>
            <p className="text-gray-600 text-sm m-0 mt-1">Replacement for defects</p>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <FiDollarSign className="mx-auto text-brand-600 mb-2" size={28} />
            <div className="text-2xl font-extrabold text-brand-600">7 Days</div>
            <p className="text-gray-600 text-sm m-0 mt-1">Refund processing</p>
          </div>
        </div>

        {/* 30-Day Return Policy */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">30-Day Return Policy</h2>
        <p className="text-gray-600 leading-relaxed">
          We want you to be 100% satisfied with your purchase. If for any reason you're not happy with your ZoltMount product, you may return it within <strong>30 days of delivery</strong> for a full refund of the purchase price.
        </p>

        {/* Return Conditions */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Return Conditions</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          To be eligible for a return, the following conditions must be met:
        </p>
        <ul className="space-y-2">
          {[
            'Product must be in its original, unopened packaging',
            'Product must not have been installed or used',
            'All parts, accessories, and hardware must be included',
            'Original receipt or proof of purchase is required',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
              <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Return Process */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">How to Return a Product</h2>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Request an RMA', desc: 'Contact us at support@zoltmount.com with your order number and reason for return. We\'ll issue a Return Merchandise Authorization (RMA) number within 1 business day.' },
            { step: 2, title: 'Pack & Ship', desc: 'Securely pack the product in its original packaging with all included parts. Write the RMA number on the outside of the box. Ship the package to the address we provide. Return shipping costs are the customer\'s responsibility.' },
            { step: 3, title: 'Inspection', desc: 'Once we receive your return, our team will inspect the product within 2-3 business days to confirm it meets return conditions.' },
            { step: 4, title: 'Refund', desc: 'After approval, your refund will be processed to the original payment method within 7 business days. You\'ll receive an email confirmation when the refund has been issued.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{step}</div>
              <div>
                <h4 className="font-semibold text-gray-900 m-0">{title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed m-0 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Refund Method */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Refund Method</h2>
        <p className="text-gray-600 leading-relaxed">
          All refunds are returned to the <strong>original payment method</strong> used at checkout. Please allow 5-10 additional business days for the refund to appear on your statement, depending on your bank or payment provider.
        </p>

        {/* Damaged / Missing Parts */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-10">
          <div className="flex items-center gap-2 mb-3">
            <FiRotateCcw className="text-green-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900 m-0">Damaged or Missing Parts?</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed m-0">
            If your product arrives damaged or with missing parts, please contact us within <strong>48 hours of delivery</strong>. We will send replacement parts or a full replacement unit <strong>at no cost</strong>, including free shipping. Please include photos of the damage and your order number when contacting us.
          </p>
        </div>

        {/* Non-Returnable Items */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Non-Returnable Items</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          The following items are <strong>not eligible</strong> for return or refund:
        </p>
        <ul className="space-y-2">
          {[
            'Products that have been installed or mounted',
            'Products with visible signs of use, scratches, or damage caused by the customer',
            'Products returned without original packaging or missing parts',
            'Products returned after the 30-day return window',
            'Products purchased from unauthorized third-party sellers',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
              <FiX className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-10 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Need to Start a Return?</h3>
          <p className="text-gray-600 text-sm mb-4">Our support team will guide you through the process quickly and easily.</p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors no-underline"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
