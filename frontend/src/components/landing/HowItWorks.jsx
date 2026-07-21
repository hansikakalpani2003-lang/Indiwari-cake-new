const STEPS = [
  {
    number: 1,
    icon: "🔍",
    title: "Browse",
    description: "Explore our delicious cake collection.",
  },
  {
    number: 2,
    icon: "🎨",
    title: "Customise",
    description: "Choose size, flavour and decoration.",
  },
  {
    number: 3,
    icon: "🛒",
    title: "Order",
    description: "Confirm your order and delivery details.",
  },
  {
    number: 4,
    icon: "📱",
    title: "Track",
    description: "Scan your QR code to track delivery.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-24">

        <div className="text-center mb-20">
          <p className="uppercase tracking-[0.3em] text-[#E91E63] text-xs font-semibold">
            SIMPLE PROCESS
          </p>

          <h2 className="mt-4 text-5xl font-serif italic text-[#1F2A44]">
            How It Works
          </h2>

          <p className="mt-5 text-[#667085]">
            Ordering your favourite cake takes only a few minutes.
          </p>
        </div>

        <div className="relative grid md:grid-cols-4 gap-8">

          <div className="hidden md:block absolute top-8 left-24 right-24 h-1 bg-pink-200"></div>

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-[#FFF9FB] rounded-2xl p-6 text-center hover:shadow-xl transition duration-300"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF7CB9] flex items-center justify-center text-3xl text-white shadow-lg">
                {step.icon}
              </div>

              <span className="block mt-5 text-xs font-bold tracking-widest text-[#E91E63]">
                STEP {step.number}
              </span>

              <h3 className="mt-2 text-lg font-bold text-[#1F2A44]">
                {step.title}
              </h3>

              <p className="mt-3 text-[#667085] text-sm leading-6">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;