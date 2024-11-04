import { motion } from "framer-motion";

const ExampleOutput = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-4">
            Intelligent Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how AudioCod breaks down voice patterns and emotional signatures
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 font-mono text-sm"
        >
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <p className="text-primary-500 mb-1">[Initializing voice analysis...]</p>
              <p className="text-primary-500 mb-1">[Processing audio patterns...]</p>
              <p className="text-primary-500 mb-4">[Generating voice profile...]</p>
            </div>
            
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">
                <span className="text-primary-500">Voice Profile</span> 
                <br />
                Pitch Range: 120-180Hz
                <br />
                Clarity Score: 92%
                <br />
                Stability Index: 0.87
              </p>
            </div>
            
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">
                <span className="text-primary-500">Emotional Analysis</span>
                <br />
                Primary: Confident (0.82)
                <br />
                Secondary: Engaged (0.65)
                <br />
                Mood Trajectory: Positive
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-primary-500">[Analysis Confidence: 94%]</p>
            <p className="text-primary-500">[Processing Time: 1.2s]</p>
            <p className="text-primary-500">[Audio Quality: High]</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExampleOutput;