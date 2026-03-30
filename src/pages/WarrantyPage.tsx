import React from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiCheck, FiX } from 'react-icons/fi'
import { useSEO } from '../hooks/useSEO'

export const WarrantyPage: React.FC = () => {
  useSEO({ title: 'Warranty Policy | ZoltMount', description: 'ZoltMount 5-year structural warranty. Learn what\'s covered and how to make a claim.', canonical: '/warranty' })
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Warranty Policy</h1>
          <p className="text-gray-300 mt-3 text-sm">We stand behind the quality of every ZoltMount product</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">

        {/* Overview */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <FiShield className="text-brand-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900 m-0">Warranty Coverage at a Glance</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-brand-100">
              <div className="text-3xl font-extrabold text-brand-600">5 Years</div>
              <div className="text-gray-600 text-sm mt-1">Structural components</div>
              <p className="text-gray-500 text-xs m-0 mt-1">Wall plates, main arms, brackets</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-brand-100">
              <div className="text-3xl font-extrabold text-brand-600">1 Year</div>
              <div className="text-gray-600 text-sm mt-1">Moving parts & accessories</div>
              <p className="text-gray-500 text-xs m-0 mt-1">Tilt mechanisms, swivels, hardware</p>
            </div>
          </div>
        </div>

        {/* What's Covered */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">What's Covered</h2>
        <p className="text-gray-600 leading-relaxed">
          Our warranty covers defects in materials and workmanship that occur under normal, intended use. Specifically:
        </p>
        <ul className="space-y-2 mt-3">
          {[
            'Manufacturing defects — any flaw present at the time of production',
            'Material failure — cracking, bending, or breaking under normal load conditions',
            'Structural integrity issues — welds, joints, or connections that fail under rated weight',
            'Finish defects — peeling, bubbling, or premature rust on coated surfaces',
            'Missing or defective hardware — bolts, screws, or brackets that arrive damaged',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
              <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* What's Not Covered */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">What's Not Covered</h2>
        <p className="text-gray-600 leading-relaxed">
          The following situations are not covered under our warranty:
        </p>
        <ul className="space-y-2 mt-3">
          {[
            'Damage caused by improper installation or failure to follow included instructions',
            'Modifications, alterations, or unauthorized repairs',
            'Normal wear and tear, including cosmetic scratches from use',
            'Damage caused by exceeding the stated weight capacity',
            'Damage from natural disasters, accidents, or acts of God',
            'Products purchased from unauthorized resellers',
            'Use of the mount for purposes other than its intended design',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
              <FiX className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Claim Process */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">How to File a Warranty Claim</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Filing a warranty claim is simple. Follow these steps:
        </p>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Contact Us', desc: 'Email us at support@zoltmount.com or reach out via our Contact page. Include your order number and a brief description of the issue.' },
            { step: 2, title: 'Provide Evidence', desc: 'Attach clear photos of the defective part(s). Include images of the product label showing the model number, and any damage visible.' },
            { step: 3, title: 'Review & Approval', desc: 'Our team will review your claim within 2-3 business days and determine if the issue falls under warranty coverage.' },
            { step: 4, title: 'Resolution', desc: 'If approved, we will send a replacement part or full replacement unit at no charge. In some cases, we may offer a full refund instead.' },
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

        {/* Contact */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Contact Our Warranty Team</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <ul className="list-none pl-0 text-gray-600 space-y-2 m-0">
            <li><strong>Email:</strong> <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a></li>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/85261509207" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">+852 6150 9207</a></li>
            <li><strong>Response Time:</strong> Within 1 business day</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors no-underline"
          >
            Submit a Warranty Claim
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
