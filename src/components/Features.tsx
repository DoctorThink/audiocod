import { motion } from "framer-motion";
import { AudioWaveform, Brain, FileAudio, Fingerprint, Gauge } from "lucide-react";

const features = [
  {
    icon: <FileAudio className="w-8 h-8" />,
    title: "Advanced Audio Processing",
    description: "Process and analyze audio files with state-of-the-art algorithms for comprehensive voice analysis"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Emotional Intelligence",
    description: "Detect and analyze emotional patterns in speech using advanced machine learning models"
  },
  {
    icon: <Fingerprint className="w-8 h-8" />,
    title: "Voice DNA Analysis",
    description: "Create unique voice profiles with detailed characteristics and patterns"
  },
  {
    icon: <Gauge className="w-8 h-8" />,
    title: "Real-time Processing",
    description: "Get instant analysis results with our high-performance processing engine"
  }
];

const Features = () => {
  return (
    <div id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-4">
            Powerful Audio Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of voice analysis with our comprehensive suite of features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="text-primary-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;