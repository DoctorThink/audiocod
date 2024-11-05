import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const AudioPlayer = ({ isPlaying, onPlayPause }: AudioPlayerProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          className="w-12 h-12 rounded-full hover:bg-primary-50 transition-colors"
        >
          {isPlaying ? 
            <Pause className="w-6 h-6 text-primary-500" /> : 
            <Play className="w-6 h-6 text-primary-500" />
          }
        </Button>
        <div className="flex space-x-1">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary-400 rounded-full"
              animate={{
                height: isPlaying ? [20, 40, 20] : 20
              }}
              transition={{
                duration: 0.5,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      </div>
      <Volume2 className="w-6 h-6 text-gray-400" />
    </div>
  );
};

export default AudioPlayer;