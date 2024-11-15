import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import EmotionChart from "../audio/EmotionChart";
import VoiceMetrics from "../audio/VoiceMetrics";
import Seismograph from "./Seismograph";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AnalysisResult } from "@/services/audioAnalysis";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResultsProps {
  results: AnalysisResult;
  onReset: () => void;
}

const AnalysisResults = ({ results, onReset }: AnalysisResultsProps) => {
  const { toast } = useToast();

  // Validate results data
  if (!results || !results.speakerProfile || !results.emotions || !results.timeSeriesData) {
    console.error('Invalid analysis results:', results);
    toast({
      variant: "destructive",
      title: "Error displaying results",
      description: "The analysis results are incomplete or invalid.",
    });
    return (
      <Card className="p-6 text-center">
        <CardContent>
          <p className="text-red-500">Error: Invalid analysis results</p>
          <Button onClick={onReset} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/90 border-primary-100 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary-900">Analysis Results</CardTitle>
          <p className="text-sm text-gray-500">Detailed breakdown of your voice analysis</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Metrics and Emotions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Card>
              <CardHeader>
                <CardTitle>Voice Analysis Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer>
                    <LineChart data={results.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#10B981" 
                        name="Energy"
                      />
                    </LineChart>
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
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Record Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnalysisResults;