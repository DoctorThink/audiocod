import { motion } from "framer-motion";
import { FileAudio, Waveform, Brain, ChartBar } from "lucide-react";

const steps = [
  {
    icon: <FileAudio className="w-8 h-8" />,
    number: "01",
    title: "Upload Audio",
    description: "Upload your audio file or record directly through our interface"
  },
  {
    icon: <Waveform className="w-8 h-8" />,
    number: "02",
    title: "Signal Processing",
    description: "Advanced algorithms analyze voice patterns and characteristics"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    number: "03",
    title: "AI Analysis",
    description: "Machine learning models process emotional and contextual data"
  },
  {
    icon: <ChartBar className="w-8 h-8" />,
    number: "04",
    title: "Results",
    description: "Get detailed insights about voice characteristics and emotions"
  }
];

const HowItWorks = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to unlock powerful voice analysis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="text-primary-500">
                  {step.icon}
                </div>
              </div>
              <div className="text-6xl font-bold text-primary-100 absolute -top-4 -left-4 opacity-20">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-900 text-center">
                {step.title}
              </h3>
              <p className="text-gray-600 text-center">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;