import { Progress } from "../ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  progress: number;
  stage: string;
  timeElapsed: number;
}

const AnalysisProgress = ({ progress, stage, timeElapsed }: AnalysisProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 border-primary-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary-600">
              <span>{stage}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="text-sm text-gray-500 text-right">
            Time elapsed: {timeElapsed.toFixed(1)}s
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnalysisProgress;