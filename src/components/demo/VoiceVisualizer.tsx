import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isRecording: boolean;
}

const VoiceVisualizer = ({ isRecording }: VoiceVisualizerProps) => {
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary-400 rounded-full"
          animate={{
            height: isRecording ? [20, Math.random() * 60 + 20, 20] : 20,
            opacity: isRecording ? 1 : 0.3,
          }}
          transition={{
            duration: 0.5,
            repeat: isRecording ? Infinity : 0,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;