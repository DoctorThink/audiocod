const steps = [
  {
    number: "01",
    title: "Character Profiling",
    description: "Input character details including physical traits, personality, and voice preferences."
  },
  {
    number: "02",
    title: "Voice DNA Creation",
    description: "Our AI analyzes inputs to create unique voice signatures with precise characteristics."
  },
  {
    number: "03",
    title: "Context Mapping",
    description: "Set the scene, emotional context, and conversation parameters."
  },
  {
    number: "04",
    title: "Dialogue Generation",
    description: "Advanced algorithms create natural, flowing conversations with realistic speech patterns."
  }
];

const HowItWorks = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-6xl font-bold text-primary-100 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-900">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;