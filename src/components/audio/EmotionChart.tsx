import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface EmotionChartProps {
  emotions: Record<string, number>;
}

const EmotionChart = ({ emotions }: EmotionChartProps) => {
  const emotionColors = {
    neutral: "bg-gray-400 from-gray-400/20 to-gray-400/60",
    happy: "bg-green-400 from-green-400/20 to-green-400/60",
    sad: "bg-blue-400 from-blue-400/20 to-blue-400/60",
    angry: "bg-red-400 from-red-400/20 to-red-400/60",
    fearful: "bg-purple-400 from-purple-400/20 to-purple-400/60"
  };

  const emotionIcons = {
    neutral: "😐",
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fearful: "😨"
  };

  // Ensure values are properly normalized
  const normalizedEmotions = { ...emotions };
  const total = Object.values(emotions).reduce((sum, value) => sum + value, 0);
  if (total !== 100) {
    Object.keys(normalizedEmotions).forEach(key => {
      normalizedEmotions[key] = (emotions[key] / total) * 100;
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Emotional Analysis</span>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
          >
            Real-time
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          <AnimatePresence>
            {Object.entries(normalizedEmotions).map(([emotion, value], index) => (
              <motion.div
                key={emotion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="h-32 relative bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${emotionColors[emotion as keyof typeof emotionColors]}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: index * 0.1 
                    }}
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xl"
                  >
                    {emotionIcons[emotion as keyof typeof emotionIcons]}
                  </motion.div>
                </div>
                <motion.p 
                  className="mt-2 text-sm font-medium capitalize"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {emotion}
                </motion.p>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {value.toFixed(1)}%
                </motion.p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionChart;