import React from 'react'
import { Link } from 'react-router-dom'
import { FiTool, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { useSEO } from '../hooks/useSEO'

export const InstallGuidePage: React.FC = () => {
  useSEO({ title: 'Installation Guide | ZoltMount', description: 'Step-by-step TV mount installation guide. Tools needed, safety tips, and video tutorials.', canonical: '/install' })
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">Installation Guides</h1>
          <p className="text-gray-300 mt-3 text-sm">Step-by-step instructions to mount your TV safely and securely</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm max-w-none">

        {/* Tools */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FiTool className="text-brand-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900 m-0">Tools You'll Need</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Power drill with bits',
              'Level (or phone level app)',
              'Pencil',
              'Tape measure',
              'Phillips screwdriver',
              'Stud finder',
              'Socket wrench (included)',
              'Masking tape',
            ].map((tool) => (
              <div key={tool} className="flex items-center gap-2 text-gray-600 text-sm">
                <FiCheckCircle className="text-green-500 flex-shrink-0" size={14} />
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wall Types */}
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Identify Your Wall Type</h2>
        <p className="text-gray-600 leading-relaxed">
          Before you begin, it's important to identify your wall type, as the mounting method varies for each.
        </p>

        <div className="space-y-4 mt-4">
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wood Stud Wall</h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0">
              The most common and ideal wall type for TV mounting. Use a stud finder to locate studs (typically 16" apart). Always mount directly into studs for maximum strength. Use the lag bolts included with your mount kit.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Concrete / Brick Wall</h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0">
              Requires a hammer drill and concrete anchors (included with most ZoltMount kits). Pre-drill holes using a masonry bit, insert anchors, then secure the wall plate with bolts. Concrete walls offer excellent holding strength.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drywall (No Studs)</h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0">
              <strong className="text-red-600">Not recommended for TVs over 30 lbs.</strong> If studs are unavailable, use heavy-duty toggle bolts or a specialized drywall anchor rated for your TV's weight. For larger TVs, consider a plywood backing panel secured to studs.
            </p>
          </div>
        </div>

        {/* Fixed Mount */}
        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">Fixed Mount Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">A low-profile mount that holds your TV flat against the wall. Best for eye-level installations where no tilt or swivel is needed.</p>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Mark & Measure', desc: 'Use a stud finder to locate studs. Hold the wall plate at desired height and mark drill holes with a pencil. Use a level to ensure marks are perfectly horizontal.' },
            { step: 2, title: 'Drill & Anchor', desc: 'Drill pilot holes at marked positions. For wood studs, use the provided lag bolts. For concrete, insert masonry anchors first.' },
            { step: 3, title: 'Attach Wall Plate', desc: 'Secure the wall plate to the wall using the provided bolts. Tighten all bolts firmly and verify the plate is level.' },
            { step: 4, title: 'Hang the TV', desc: 'Attach the TV brackets to the back of your TV using the appropriate VESA screws. Lift the TV and hook the brackets onto the wall plate. Verify it\'s secure.' },
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

        {/* Tilt Mount */}
        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">Tilt Mount Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">Allows you to angle the TV downward, ideal for mounting above eye level or over a fireplace. Reduces glare and improves viewing angles.</p>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Mark & Measure', desc: 'Locate studs with a stud finder. Position the wall plate at your desired height, mark drill holes, and confirm they are level.' },
            { step: 2, title: 'Drill & Anchor', desc: 'Drill pilot holes into studs or insert concrete anchors. Ensure holes are the correct depth for the provided hardware.' },
            { step: 3, title: 'Attach Wall Plate', desc: 'Bolt the wall plate to the wall. Double-check that it is level and all bolts are fully tightened.' },
            { step: 4, title: 'Install Tilt Arms', desc: 'Attach the tilt brackets to the back of your TV using the correct VESA screws and spacers (if needed).' },
            { step: 5, title: 'Hang & Adjust', desc: 'Lift the TV onto the wall plate. Hook the brackets in place, then adjust the tilt angle to your preferred viewing position. Lock the tilt mechanism.' },
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

        {/* Full-Motion Mount */}
        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">Full-Motion Mount Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">Extends, swivels, and tilts for maximum flexibility. Perfect for corner installations or rooms where you want to view the TV from multiple angles.</p>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Mark & Measure', desc: 'Locate two studs (full-motion mounts typically require two attachment points). Hold the wall plate in position and mark all drill holes. Verify level alignment.' },
            { step: 2, title: 'Drill & Anchor', desc: 'Drill pilot holes into both studs. For concrete walls, use a hammer drill with masonry bits and insert anchors.' },
            { step: 3, title: 'Attach Wall Plate', desc: 'Secure the wall plate with all provided lag bolts. This mount bears the most stress, so ensure every bolt is fully tightened.' },
            { step: 4, title: 'Assemble Arm', desc: 'Follow the included diagram to assemble the articulating arm. Attach the arm to the wall plate and tighten the pivot bolts.' },
            { step: 5, title: 'Cable Management', desc: 'Route HDMI, power, and other cables through the arm\'s integrated cable channels (if available). Use cable ties or adhesive clips for a clean look.' },
            { step: 6, title: 'Mount & Adjust', desc: 'Attach the TV bracket to the back of your TV. With a helper, hang the TV onto the arm. Adjust extension, swivel, and tilt to your preference. Tighten all locking mechanisms.' },
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

        {/* Safety Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-yellow-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900 m-0">Safety Tips</h2>
          </div>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-0">
            <li><strong>Always work with a helper</strong> — TVs over 40" should always be lifted and mounted by two people.</li>
            <li><strong>Confirm weight capacity</strong> — Check that your mount's rated capacity exceeds your TV's weight. Never exceed the listed maximum.</li>
            <li><strong>Mount into studs whenever possible</strong> — Drywall alone cannot support the weight of most TVs.</li>
            <li><strong>Hide cables safely</strong> — Never run power cords inside the wall unless using an in-wall rated power extension. Use cable raceways or cord covers for a clean setup.</li>
            <li><strong>Turn off power</strong> — If routing cables near electrical outlets, turn off the circuit breaker first.</li>
            <li><strong>Check for pipes and wires</strong> — Before drilling, use a stud finder with wire detection to avoid hitting plumbing or electrical wiring.</li>
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <FiInfo className="text-red-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900 m-0">Common Mistakes to Avoid</h2>
          </div>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-0">
            <li><strong>Not drilling into studs</strong> — The #1 cause of mount failure. Always verify stud locations before drilling.</li>
            <li><strong>Skipping the level check</strong> — A mount that's even slightly off-level will be very noticeable once the TV is hung.</li>
            <li><strong>Over-tightening screws</strong> — This can strip the hole in drywall or crack masonry. Tighten firmly but don't force it.</li>
            <li><strong>Using wrong VESA screws</strong> — Using screws that are too long can damage your TV's internals. Check the required screw length in your TV's manual.</li>
            <li><strong>Forgetting cable access</strong> — Plan your cable routing before mounting. It's much harder to manage cables after the TV is on the wall.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help with your installation? Our support team is here to assist.</p>
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
