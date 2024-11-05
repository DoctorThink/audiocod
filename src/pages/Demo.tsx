import { useState } from "react";
import { Activity, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AudioRecorder from "@/components/audio/AudioRecorder";
import EmotionChart from "@/components/audio/EmotionChart";
import VoiceMetrics from "@/components/audio/VoiceMetrics";
import { analyzeAudio, type AnalysisResult } from "@/services/audioAnalysis";

const Demo = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: analysisResults, refetch: runAnalysis, isLoading } = useQuery({
    queryKey: ['audioAnalysis'],
    queryFn: async () => {
      if (!audioBlob) throw new Error('No audio recorded');
      return analyzeAudio(audioBlob);
    },
    enabled: false
  });

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    toast({
      title: "Recording complete",
      description: "You can now analyze the audio.",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Link to="/" className="self-start">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Voice DNA Analysis</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          {audioBlob && (
            <Button 
              onClick={() => runAnalysis()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Analyze Audio
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recorded Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analysisResults && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8 animate-fade-in"
        >
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{analysisResults.transcription}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <VoiceMetrics speakerProfile={analysisResults.speakerProfile} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <EmotionChart emotions={analysisResults.emotions} />
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Voice Analysis Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <LineChart width={800} height={400} data={analysisResults.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Demo;