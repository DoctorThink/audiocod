import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import EmotionChart from "../audio/EmotionChart";
import VoiceMetrics from "../audio/VoiceMetrics";
import Seismograph from "./Seismograph";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ResponsiveContainer } from 'recharts';

interface AnalysisResultsProps {
  results: any;
  onReset: () => void;
}

const AnalysisResults = ({ results, onReset }: AnalysisResultsProps) => {
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
          <CardContent className="space-y-8">
            {/* Audio Waveform */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary-900">Audio Waveform</h3>
              <Seismograph 
                data={results.timeSeriesData.map((d: any) => d.energy)} 
                height={150}
              />
            </div>

            {/* Voice Metrics and Emotions */}
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
            
            {/* Time Series Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-white/80">
                <CardHeader>
                  <CardTitle className="text-primary-900">Voice Analysis Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer>
                      <LineChart data={results.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (s)', position: 'bottom' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          label={{ value: 'Pitch (Hz)', angle: -90, position: 'left' }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          label={{ value: 'Energy', angle: 90, position: 'right' }}
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
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Energy Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/80">
                <CardHeader>
                  <CardTitle className="text-primary-900">Energy Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer>
                      <AreaChart data={results.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#4F46E5"
                          fill="url(#colorEnergy)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onReset}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisResults;