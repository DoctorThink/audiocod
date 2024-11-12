import { motion } from "framer-motion";
import { Mic } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
}

const RecordingStatus = ({ isRecording }: RecordingStatusProps) => {
  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isRecording ? [1, 1.2, 1] : 1,
          opacity: isRecording ? [1, 0.5, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isRecording ? Infinity : 0,
        }}
        className="absolute -inset-4 bg-red-500/20 rounded-full"
      />
      <motion.div
        animate={{
          scale: isRecording ? 1.1 : 1,
        }}
        className="relative z-10"
      >
        <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-primary-500'}`} />
      </motion.div>
    </div>
  );
};

export default RecordingStatus;