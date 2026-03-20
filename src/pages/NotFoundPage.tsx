import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiSearch } from 'react-icons/fi'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 flex items-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="text-8xl font-extrabold text-brand-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <FiHome size={16} /> Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <FiSearch size={16} /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
