import React from 'react'
import { Link } from 'react-router-dom'

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-gray-300 mt-3 text-sm">Last Updated: March 18, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">
        <p className="text-gray-600 leading-relaxed">
          Welcome to ZoltMount. These Terms of Service ("Terms") govern your access to and use of the ZoltMount website at <strong>zoltmount.com</strong> (the "Site") and all related services, including purchasing products, creating an account, and interacting with our platform. By accessing or using the Site, you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Company Information</h2>
        <p className="text-gray-600 leading-relaxed">
          ZoltMount is operated by ZoltMount LLC ("we", "us", or "our"), with its principal place of business at 1234 Industrial Ave, Suite 200, Shenzhen, GD 518000. For questions about these Terms, contact us at <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a> or +1 (888) 555-ZOLT.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Account Registration</h2>
        <p className="text-gray-600 leading-relaxed">
          To access certain features of the Site, you may be required to create an account. When registering, you agree to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li>Provide accurate, current, and complete information.</li>
          <li>Maintain and promptly update your account information.</li>
          <li>Keep your password secure and confidential.</li>
          <li>Accept responsibility for all activity under your account.</li>
          <li>Notify us immediately of any unauthorized access or use of your account.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe are being used fraudulently.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Products and Pricing</h2>
        <p className="text-gray-600 leading-relaxed">
          We make every effort to display accurate product descriptions, images, and pricing on the Site. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, or error-free. All prices are listed in US Dollars (USD) unless otherwise stated.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          We reserve the right to modify prices, discontinue products, or correct errors at any time without prior notice. If a product is listed at an incorrect price, we may cancel or refuse any orders placed at the incorrect price, even after order confirmation.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Orders and Payment</h2>
        <p className="text-gray-600 leading-relaxed">
          By placing an order, you represent that the products ordered will be used only for lawful purposes. We accept payment via major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through our payment processors.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or suspected fraud. If your order is cancelled after payment has been processed, we will issue a full refund.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Shipping and Delivery</h2>
        <p className="text-gray-600 leading-relaxed">
          ZoltMount ships to over 50 countries worldwide. Shipping costs are calculated at checkout based on your delivery address and the weight of your order. Delivery times vary by destination and shipping method selected.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          We are not responsible for delays caused by customs, weather, carrier issues, or other circumstances beyond our control. Title and risk of loss for products pass to you upon delivery to the carrier.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Returns and Refunds</h2>
        <p className="text-gray-600 leading-relaxed">
          We want you to be completely satisfied with your purchase. If you are not, you may return unused and undamaged products in their original packaging within 30 days of delivery for a full refund of the purchase price. Return shipping costs are the responsibility of the customer unless the return is due to a defective product or an error on our part.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          Refunds will be processed to the original payment method within 7-10 business days after we receive and inspect the returned product.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Warranty</h2>
        <p className="text-gray-600 leading-relaxed">
          ZoltMount products are backed by a 10-year limited warranty against defects in materials and workmanship under normal use. Select products may carry a lifetime warranty as indicated on the product page. This warranty does not cover damage resulting from misuse, improper installation, unauthorized modifications, or normal wear and tear.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          To make a warranty claim, please contact our support team with your order number and a description of the issue. We will, at our discretion, repair, replace, or refund the defective product.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Points Program</h2>
        <p className="text-gray-600 leading-relaxed">
          Registered members may earn loyalty points on qualifying purchases. Points are earned at the rate of 1 point per $100 USD spent. The use and redemption of points will be determined at our sole discretion and may be updated from time to time. Points have no cash value and are non-transferable. We reserve the right to modify, suspend, or terminate the points program at any time.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Intellectual Property</h2>
        <p className="text-gray-600 leading-relaxed">
          All content on the Site, including but not limited to text, graphics, logos, images, product designs, software, and the "ZoltMount" trademark, is the property of ZoltMount LLC or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Site without our prior written consent.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. User Conduct</h2>
        <p className="text-gray-600 leading-relaxed">
          When using the Site, you agree not to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1.5 mt-2">
          <li>Violate any applicable laws or regulations.</li>
          <li>Infringe on the intellectual property rights of others.</li>
          <li>Attempt to gain unauthorized access to the Site or its systems.</li>
          <li>Use the Site for any fraudulent or malicious purposes.</li>
          <li>Interfere with or disrupt the operation of the Site.</li>
          <li>Collect personal information of other users without their consent.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Limitation of Liability</h2>
        <p className="text-gray-600 leading-relaxed">
          To the fullest extent permitted by applicable law, ZoltMount LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or purchase of products, even if we have been advised of the possibility of such damages. Our total liability for any claim arising under these Terms shall not exceed the amount you paid for the specific product giving rise to the claim.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">12. Indemnification</h2>
        <p className="text-gray-600 leading-relaxed">
          You agree to indemnify, defend, and hold harmless ZoltMount LLC, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys' fees) arising out of or in connection with your use of the Site, violation of these Terms, or violation of any rights of a third party.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">13. Governing Law</h2>
        <p className="text-gray-600 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the People's Republic of China, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Shenzhen, Guangdong Province, China.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">14. Changes to Terms</h2>
        <p className="text-gray-600 leading-relaxed">
          We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting the revised Terms on the Site. Your continued use of the Site after any changes constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">15. Contact Us</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have questions about these Terms of Service, please contact us:
        </p>
        <ul className="list-none pl-0 text-gray-600 space-y-1.5 mt-2">
          <li><strong>Email:</strong> <a href="mailto:support@zoltmount.com" className="text-brand-600 hover:underline">support@zoltmount.com</a></li>
          <li><strong>Phone:</strong> +1 (888) 555-ZOLT</li>
          <li><strong>Address:</strong> 1234 Industrial Ave, Suite 200, Shenzhen, GD 518000</li>
        </ul>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
