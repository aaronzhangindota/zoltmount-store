import React from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

export const PrivacyPage: React.FC = () => {
  useSEO({ title: 'Privacy Policy | ZoltMount', canonical: '/privacy' })
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-gray-300 mt-3 text-sm">Last Updated: March 18, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">
        <p className="text-gray-600 leading-relaxed">
          VELL EDUCATION GROUP LIMITED ("ZoltMount", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share your information when you visit our website at <strong>zoltmount.com</strong> (the "Site"), create an account, or purchase our products.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Information We Collect</h2>

        <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">1.1 Information You Provide</h3>
        <p className="text-gray-600 leading-relaxed">
          We collect information you voluntarily provide when using our Site, including:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Account Information:</strong> Name, email address, password, and phone number when you register for an account.</li>
          <li><strong>Order Information:</strong> Billing and shipping addresses, payment details, and purchase history when you place an order.</li>
          <li><strong>Contact Information:</strong> Name, email, and message content when you contact us through our contact form or customer support.</li>
          <li><strong>Address Book:</strong> Shipping addresses you save to your account for future orders.</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">1.2 Information Collected Automatically</h3>
        <p className="text-gray-600 leading-relaxed">
          When you visit the Site, we may automatically collect certain information, including:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and referring URLs.</li>
          <li><strong>Network Information:</strong> IP address and approximate geographic location.</li>
          <li><strong>Cookies and Similar Technologies:</strong> See Section 6 below for details.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. How We Use Your Information</h2>
        <p className="text-gray-600 leading-relaxed">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li>Process and fulfill your orders, including shipping and payment processing.</li>
          <li>Create and manage your user account.</li>
          <li>Provide customer support and respond to your inquiries.</li>
          <li>Manage the loyalty points program associated with your account.</li>
          <li>Send order confirmations, shipping updates, and delivery notifications.</li>
          <li>Send marketing communications (only with your consent; you may opt out at any time).</li>
          <li>Improve our Site, products, and services.</li>
          <li>Detect and prevent fraud, unauthorized access, and other security threats.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. How We Share Your Information</h2>
        <p className="text-gray-600 leading-relaxed">
          We do not sell your personal information to third parties. We may share your information with:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Service Providers:</strong> Third-party companies that help us operate our business, such as payment processors, shipping carriers, cloud hosting providers, and customer support tools. These providers are contractually required to protect your data.</li>
          <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, reorganization, or sale of assets, your information may be transferred to the acquiring entity.</li>
          <li><strong>With Your Consent:</strong> When you have given explicit consent to share your information for a specific purpose.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Data Security</h2>
        <p className="text-gray-600 leading-relaxed">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li>Encryption of data in transit using TLS/SSL.</li>
          <li>Secure storage of account credentials.</li>
          <li>Regular security assessments and monitoring.</li>
          <li>Restricted access to personal data on a need-to-know basis.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee the absolute security of your data.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Data Retention</h2>
        <p className="text-gray-600 leading-relaxed">
          We retain your personal data for as long as your account is active or as needed to provide you services. We may also retain your data as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. Order and transaction records are retained for a minimum of 5 years for tax and legal compliance purposes.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Cookies and Tracking Technologies</h2>
        <p className="text-gray-600 leading-relaxed">
          We use cookies and similar technologies to enhance your experience on the Site. These include:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Essential Cookies:</strong> Required for the Site to function properly (e.g., shopping cart, user authentication).</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Site so we can improve it.</li>
          <li><strong>Preference Cookies:</strong> Remember your settings such as language and region preferences.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          You can control cookie settings through your browser. Disabling certain cookies may affect the functionality of the Site.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Your Rights</h2>
        <p className="text-gray-600 leading-relaxed">
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
          <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
          <li><strong>Objection:</strong> Object to the processing of your data for specific purposes, including direct marketing.</li>
          <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw your consent at any time.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          To exercise any of these rights, please contact us at <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a>. We will respond to your request within 30 days.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. International Data Transfers</h2>
        <p className="text-gray-600 leading-relaxed">
          As we operate globally and ship to over 50 countries, your personal data may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your data during such transfers in compliance with applicable data protection laws.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Children's Privacy</h2>
        <p className="text-gray-600 leading-relaxed">
          The Site is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have inadvertently collected personal data from a child under 16, we will take steps to delete such information promptly. If you believe a child has provided us with personal information, please contact us at <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a>.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Third-Party Links</h2>
        <p className="text-gray-600 leading-relaxed">
          The Site may contain links to third-party websites (e.g., package tracking services, social media platforms). We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Changes to This Policy</h2>
        <p className="text-gray-600 leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will post the updated policy on this page with a revised "Last Updated" date. We encourage you to review this page periodically. Continued use of the Site after changes are posted constitutes acceptance of the revised policy.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">12. Contact Us</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        <ul className="list-none pl-0 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Email:</strong> <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a></li>
          <li><strong>WhatsApp:</strong> +852 6150 9207</li>
          <li><strong>Address:</strong> Room C10, 4/F, Block C2, Hang Wai Industrial Centre, No. 6 Kin Tai Street, Tuen Mun, Hong Kong</li>
        </ul>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
