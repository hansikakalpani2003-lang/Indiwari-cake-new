/**
 * HowItWorks.jsx
 * Four-step explainer: Browse → Customise → Order → Scan QR.
 * Static content, no API calls.
 */

import React from 'react';

const STEPS = [
  { number: 1, icon: '🔍', title: 'Browse',    description: 'Explore our full range of cakes by category.' },
  { number: 2, icon: '🎨', title: 'Customise',  description: 'Pick a size, flavour, and add a decoration note.' },
  { number: 3, icon: '🛒', title: 'Order',      description: 'Confirm your delivery address and place the order.' },
  { number: 4, icon: '📱', title: 'Scan QR',    description: 'Get a unique QR code to track and verify on delivery.' },
];

const HowItWorks = () => {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            How It Works
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            From browsing to your doorstep in four simple steps.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-pink-100" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 h-16 w-16 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {step.icon}
              </div>
              <span className="mt-3 text-xs font-bold text-pink-600">STEP {step.number}</span>
              <h3 className="mt-1 text-base font-bold text-gray-800">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-[200px]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;