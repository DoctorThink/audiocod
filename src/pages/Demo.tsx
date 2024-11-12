import { useState } from "react";
import { Activity, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AudioRecorder from "@/components/audio/AudioRecorder";
import EmotionChart from "@/components/audio/EmotionChart";
import VoiceMetrics from "@/components/audio/VoiceMetrics";
import { analyzeAudio } from "@/services/audioAnalysis";
import VoiceVisualizer from "@/components/demo/VoiceVisualizer";
import Seismograph from "@/components/demo/Seismograph";
import RecordingStatus from "@/components/demo/RecordingStatus";

const Demo = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
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
    setIsRecording(false);
    toast({
      title: "Recording complete",
      description: "You can now analyze the audio.",
    });
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <div className="container py-8 space-y-8 px-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link to="/" className="self-start">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            Voice DNA Analysis
          </h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
            />
            {audioBlob && (
              <Button 
                onClick={() => runAnalysis()}
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
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

        <div className="relative">
          <RecordingStatus isRecording={isRecording} />
          <VoiceVisualizer isRecording={isRecording} />
        </div>

        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Card className="backdrop-blur-sm bg-white/80 border-primary-100">
              <CardHeader>
                <CardTitle>Recorded Audio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                {analysisResults?.timeSeriesData && (
                  <Seismograph 
                    data={analysisResults.timeSeriesData.map(d => d.energy)} 
                    height={150}
                  />
                )}
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
            <Card className="backdrop-blur-sm bg-white/80 border-primary-100">
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-primary-900">{analysisResults.transcription}</p>
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
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Demo;