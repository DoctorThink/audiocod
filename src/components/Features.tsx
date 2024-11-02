import { Cpu, Waveform, Users, Brain } from "lucide-react";

const features = [
  {
    icon: <Waveform className="w-8 h-8" />,
    title: "Voice DNA Creation",
    description: "Generate unique voice profiles with physical characteristics, acoustic properties, and speech patterns"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Natural Speech Patterns",
    description: "Advanced algorithms for realistic dialogue generation with emotional depth and context awareness"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Multi-Character Support",
    description: "Create dynamic conversations between multiple characters with distinct personalities"
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "Real-time Processing",
    description: "Instant dialogue generation with environmental sound integration and acoustic modeling"
  }
];

const Features = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-primary-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;