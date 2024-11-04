import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AudioWaveform } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
      {/* Animated background waves */}
      <div className="absolute inset-0 flex justify-center items-center opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-1 bg-primary-300/20 mx-2 rounded-full animate-wave"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <AudioWaveform className="w-12 h-12 text-primary-300 mr-3" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Audio<span className="text-primary-300">Cod</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Advanced AI-powered audio analysis platform for precise voice profiling and emotional intelligence
          </p>
          <div className="space-x-4">
            <Link 
              to="/demo"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-400 transition-colors"
            >
              Try Demo
            </Link>
            <a 
              href="#features"
              className="inline-block border border-primary-300 text-primary-100 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-800/50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;