import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import EmotionChart from "../audio/EmotionChart";
import VoiceMetrics from "../audio/VoiceMetrics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalysisResultsProps {
  results: any;
}

const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  if (!results) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <Card className="backdrop-blur-sm bg-white/80 border-primary-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary-900">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <VoiceMetrics speakerProfile={results.speakerProfile} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <EmotionChart emotions={results.emotions} />
              </motion.div>
            </div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-semibold text-lg text-primary-900">Voice Quality Metrics</h3>
              <div className="space-y-6">
                {Object.entries(results.speakerProfile.characteristics).map(([key, value]: [string, number], index) => (
                  <motion.div 
                    key={key} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-primary-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-primary-600">{typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value}</span>
                    </div>
                    <Progress 
                      value={typeof value === 'number' ? value * 100 : 0} 
                      className="h-2 bg-primary-100"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="backdrop-blur-sm bg-white/80">
                <CardHeader>
                  <CardTitle className="text-primary-900">Voice Analysis Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <LineChart width={800} height={400} data={results.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'bottom' }}
                        stroke="#4F46E5"
                      />
                      <YAxis 
                        yAxisId="left" 
                        label={{ value: 'Pitch (Hz)', angle: -90, position: 'left' }}
                        stroke="#4F46E5"
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        label={{ value: 'Energy', angle: 90, position: 'right' }}
                        stroke="#10B981"
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="pitch" 
                        stroke="#4F46E5" 
                        name="Pitch"
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#10B981" 
                        name="Energy"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisResults;