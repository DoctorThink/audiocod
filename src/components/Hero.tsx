import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 flex justify-center items-center">
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Dialogue<span className="text-primary-300">Vox</span> 2.0
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Advanced AI dialogue generation with precise voice characteristic mapping and natural speech patterns
          </p>
          <button className="bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-400 transition-colors">
            Try Demo
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;