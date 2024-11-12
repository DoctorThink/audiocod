import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        className="space-y-6 sm:space-y-8"
      >
        <Card className="backdrop-blur-sm bg-white/90 border-primary-100 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary-900">Analysis Results</CardTitle>
            <p className="text-sm text-gray-500">Detailed breakdown of your voice analysis</p>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            {/* Audio Waveform with improved styling */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg sm:text-xl text-primary-900">Audio Waveform</h3>
              <div className="bg-primary-50/50 p-4 rounded-lg">
                <Seismograph 
                  data={results.timeSeriesData.map((d: any) => d.energy)} 
                  height={150}
                />
              </div>
            </div>

            {/* Voice Metrics and Emotions with responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <VoiceMetrics speakerProfile={results.speakerProfile} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <EmotionChart emotions={results.emotions} />
              </motion.div>
            </div>
            
            {/* Time Series Analysis with improved styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-primary-900">Voice Analysis Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px] sm:h-[400px] p-2">
                    <ResponsiveContainer>
                      <LineChart data={results.timeSeriesData}>
                        <defs>
                          <linearGradient id="pitchGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (s)', position: 'bottom' }}
                          stroke="#6B7280"
                        />
                        <YAxis 
                          yAxisId="left"
                          label={{ value: 'Pitch (Hz)', angle: -90, position: 'left' }}
                          stroke="#6B7280"
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          label={{ value: 'Energy', angle: 90, position: 'right' }}
                          stroke="#6B7280"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="pitch" 
                          stroke="#4F46E5" 
                          strokeWidth={2}
                          dot={false}
                          name="Pitch"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={false}
                          name="Energy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Energy Distribution with gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-primary-900">Energy Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px] sm:h-[300px] p-2">
                    <ResponsiveContainer>
                      <AreaChart data={results.timeSeriesData}>
                        <defs>
                          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="time" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#4F46E5"
                          fill="url(#colorEnergy)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="flex justify-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onReset}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md text-base"
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