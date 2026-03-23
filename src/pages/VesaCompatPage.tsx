import React from 'react'
import { Link } from 'react-router-dom'

export const VesaCompatPage: React.FC = () => {
  const vesaData = [
    { vesa: '75x75', size: '13" - 22"', weight: 'Up to 15 lbs', type: 'Small monitors, kitchen TVs' },
    { vesa: '100x100', size: '19" - 27"', weight: 'Up to 33 lbs', type: 'Computer monitors, small TVs' },
    { vesa: '200x100', size: '22" - 37"', weight: 'Up to 55 lbs', type: 'Medium TVs, bedroom displays' },
    { vesa: '200x200', size: '26" - 42"', weight: 'Up to 55 lbs', type: 'Medium TVs' },
    { vesa: '300x300', size: '32" - 55"', weight: 'Up to 88 lbs', type: 'Large TVs' },
    { vesa: '400x200', size: '37" - 55"', weight: 'Up to 88 lbs', type: 'Large TVs' },
    { vesa: '400x400', size: '42" - 65"', weight: 'Up to 110 lbs', type: 'Large to extra-large TVs' },
    { vesa: '600x400', size: '55" - 90"', weight: 'Up to 150 lbs', type: 'Extra-large and premium TVs' },
  ]

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">VESA Compatibility Guide</h1>
          <p className="text-gray-300 mt-3 text-sm">Find the right mount for your TV using the VESA standard</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">

        {/* What is VESA */}
        <h2 className="text-xl font-bold text-gray-900 mt-0 mb-4">What Is VESA?</h2>
        <p className="text-gray-600 leading-relaxed">
          <strong>VESA</strong> (Video Electronics Standards Association) defines a universal mounting interface for TVs and monitors. The VESA pattern refers to the four threaded holes on the back of your TV arranged in a square or rectangular pattern. This standardized spacing ensures that any VESA-compliant mount will fit any VESA-compliant TV.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          VESA patterns are measured in millimeters — for example, <strong>200x200mm</strong> means the holes are 200mm apart horizontally and 200mm apart vertically.
        </p>

        {/* VESA Size Chart */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">VESA Size Reference Chart</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The table below shows common VESA patterns and their typical TV sizes. Use this as a quick reference to identify which mounts are compatible with your TV.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">VESA Pattern</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">TV Size</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Max Weight</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b border-gray-200 hidden sm:table-cell">Common Use</th>
              </tr>
            </thead>
            <tbody>
              {vesaData.map((row, i) => (
                <tr key={row.vesa} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 text-gray-900 font-medium border-b border-gray-100">{row.vesa}mm</td>
                  <td className="py-3 px-4 text-gray-600 border-b border-gray-100">{row.size}</td>
                  <td className="py-3 px-4 text-gray-600 border-b border-gray-100">{row.weight}</td>
                  <td className="py-3 px-4 text-gray-600 border-b border-gray-100 hidden sm:table-cell">{row.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">How to Measure Your TV's VESA Pattern</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Follow these three simple steps to determine your TV's VESA pattern:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 m-0">Locate the Mounting Holes</h4>
              <p className="text-gray-600 text-sm leading-relaxed m-0 mt-1">
                Look at the back of your TV. You'll find four threaded holes arranged in a rectangular or square pattern. They may be recessed or covered by plastic caps.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 m-0">Measure Horizontal Distance</h4>
              <p className="text-gray-600 text-sm leading-relaxed m-0 mt-1">
                Using a tape measure, measure the distance between the center of the left hole and the center of the right hole <strong>in millimeters</strong>. This is the first number of your VESA pattern.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 m-0">Measure Vertical Distance</h4>
              <p className="text-gray-600 text-sm leading-relaxed m-0 mt-1">
                Measure the distance between the center of the top hole and the center of the bottom hole <strong>in millimeters</strong>. This is the second number. Your VESA pattern is now: <strong>horizontal x vertical</strong> (e.g., 400x400mm).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm m-0">
            <strong>Tip:</strong> You can also find the VESA pattern in your TV's user manual or on the manufacturer's website. Search for your TV model number followed by "VESA" for quick results.
          </p>
        </div>

        {/* ZoltMount Compatibility */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">ZoltMount Product Compatibility</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          All ZoltMount products support universal VESA patterns. Here's a quick guide to help you choose the right product:
        </p>

        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 m-0">Small Mounts (VESA 75x75 – 200x200)</h4>
            <p className="text-gray-600 text-sm m-0 mt-1">Ideal for monitors and TVs from 13" to 42". Available in fixed, tilt, and full-motion configurations.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 m-0">Medium Mounts (VESA 200x200 – 400x400)</h4>
            <p className="text-gray-600 text-sm m-0 mt-1">Designed for TVs from 32" to 65". Our most popular range. Features heavy-duty arms and steel construction.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 m-0">Large Mounts (VESA 400x400 – 600x400)</h4>
            <p className="text-gray-600 text-sm m-0 mt-1">Built for large TVs from 55" to 90". Supports up to 150 lbs with reinforced steel wall plates and dual-stud installation.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors no-underline"
          >
            Browse All Mounts
          </Link>
        </div>

        {/* Not Sure CTA */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-10 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Not Sure Which Mount Fits Your TV?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Send us your TV model number and we'll recommend the perfect mount for you — completely free.
          </p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors no-underline"
          >
            Contact Us for Help
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
