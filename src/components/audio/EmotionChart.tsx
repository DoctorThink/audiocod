import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface EmotionChartProps {
  emotions: Record<string, number>;
}

const EmotionChart = ({ emotions }: EmotionChartProps) => {
  const emotionColors = {
    neutral: "bg-gray-400",
    happy: "bg-green-400",
    sad: "bg-blue-400",
    angry: "bg-red-400",
    fearful: "bg-purple-400"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotional Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(emotions).map(([emotion, value], index) => (
            <motion.div
              key={emotion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="h-32 relative bg-gray-100 rounded-lg overflow-hidden">
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 ${emotionColors[emotion as keyof typeof emotionColors]} transition-all duration-500`}
                  initial={{ height: 0 }}
                  animate={{ height: `${value * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-medium capitalize">{emotion}</p>
              <p className="text-xs text-muted-foreground">{(value * 100).toFixed(0)}%</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionChart;