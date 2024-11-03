import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center space-y-16"
        >
          <motion.div variants={item} className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              Audio<span className="text-primary-300">Analysis</span> AI
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
              Advanced AI-powered audio analysis with precise voice characteristic mapping
              and speaker recognition
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/demo">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-400">
                  Try Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={item} className="py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex justify-center"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <AudioWaveform className="w-12 h-12 text-primary-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Voice Analysis</h3>
              <p>Advanced algorithms for precise voice characteristic mapping</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Emotion Detection</h3>
              <p>Real-time emotion analysis and sentiment tracking</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Pattern Recognition</h3>
              <p>Identify and analyze complex speech patterns</p>
            </div>
          </motion.div>

          <motion.div 
            variants={item}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-8 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Live Demo</h2>
            <div className="aspect-video rounded-lg overflow-hidden bg-primary-800/50">
              <div className="h-full flex items-center justify-center">
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Try the Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;