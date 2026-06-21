/**
 * FeaturesSection.jsx
 * Three feature highlight cards — static content, no API calls.
 */

import React from 'react';

const FEATURES = [
  {
    icon: '📱',
    title: 'QR Order Tracking',
    description:
      'Every confirmed order gets a unique QR code. Scan it any time — no login required — to see the full order details and live delivery status.',
  },
  {
    icon: '🎨',
    title: 'Easy Customisation',
    description:
      'Choose size, flavour, and add a decoration note for every cake. Your customisation is saved with the order and shown to our bakers.',
  },
  {
    icon: '🚚',
    title: 'Delivery Updates',
    description:
      'Track your order through five clear stages — Pending, Confirmed, Being Prepared, Out for Delivery, Delivered — with an email at every step.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            Why Order With Us
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            No more lost WhatsApp messages or forgotten orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-pink-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-4xl" aria-hidden="true">{feature.icon}</span>
              <h3 className="mt-4 text-base font-bold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;