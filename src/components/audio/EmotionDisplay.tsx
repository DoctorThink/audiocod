import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import type { EmotionScores } from "@/services/audio/emotionsService";

interface EmotionDisplayProps {
  emotions: EmotionScores;
}

const EmotionDisplay = ({ emotions }: EmotionDisplayProps) => {
  const emotionColors = {
    neutral: "bg-gray-400",
    happy: "bg-green-400",
    sad: "bg-blue-400",
    angry: "bg-red-400",
    fearful: "bg-purple-400"
  };

  const emotionIcons = {
    neutral: "😐",
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fearful: "😨"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotional Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(emotions).map(([emotion, score], index) => (
          <motion.div
            key={emotion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{emotionIcons[emotion as keyof typeof emotionIcons]}</span>
                <span className="capitalize">{emotion}</span>
              </div>
              <span>{Math.round(score * 100)}%</span>
            </div>
            <Progress 
              value={score * 100} 
              className={`h-2 ${emotionColors[emotion as keyof typeof emotionColors]}`}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EmotionDisplay;