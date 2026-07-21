const FEATURES = [
  {
    icon: "📱",
    title: "QR Order Tracking",
    description:
      "Every confirmed order gets a unique QR code. Scan it anytime to view your order details and live delivery status.",
  },
  {
    icon: "🎨",
    title: "Easy Customisation",
    description:
      "Choose your cake size, flavour and decoration notes. Everything is saved for our bakers.",
  },
  {
    icon: "🚚",
    title: "Delivery Updates",
    description:
      "Receive live updates from confirmation until your cake reaches your doorstep.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#FFF5F8]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[0.3em] text-[#E91E63] text-xs font-semibold">
            WHY CHOOSE US
          </p>

          <h2 className="mt-4 text-5xl font-serif italic text-[#1F2A44]">
            Why Order With Us
          </h2>

          <p className="mt-5 text-[#667085]">
            Freshly baked cakes with a modern ordering experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF7CB9] flex items-center justify-center text-3xl shadow-lg">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#1F2A44]">
                {feature.title}
              </h3>

              <p className="mt-4 text-[#667085] leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;