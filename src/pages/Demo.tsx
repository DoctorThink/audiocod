import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { analyzeAudio } from "@/services/audioAnalysis";
import RecordingPage from "@/components/demo/RecordingPage";
import AnalysisResults from "@/components/demo/AnalysisResults";
import AnalysisProgress from "@/components/demo/AnalysisProgress";

const Demo = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  const { data: analysisResults, refetch: runAnalysis, isLoading } = useQuery({
    queryKey: ['audioAnalysis'],
    queryFn: async () => {
      if (!audioFile) throw new Error('No audio recorded');
      return analyzeAudio(audioFile);
    },
    enabled: false
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      const startTime = Date.now();
      timer = setInterval(() => {
        setTimeElapsed((Date.now() - startTime) / 1000);
        // Simulate progress stages
        setAnalysisProgress(prev => {
          if (prev < 95) {
            const newProgress = prev + (100 - prev) * 0.1;
            if (newProgress < 30) setAnalysisStage("Processing audio...");
            else if (newProgress < 60) setAnalysisStage("Analyzing patterns...");
            else if (newProgress < 90) setAnalysisStage("Generating insights...");
            return newProgress;
          }
          return prev;
        });
      }, 100);
    } else {
      setAnalysisProgress(100);
      setAnalysisStage("Analysis complete!");
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleAnalysisStart = async (file: File) => {
    setAudioFile(file);
    setAnalysisProgress(0);
    setTimeElapsed(0);
    setAnalysisStage("Initializing analysis...");
    await runAnalysis();
  };

  const resetAnalysis = () => {
    setAudioFile(null);
    setAnalysisProgress(0);
    setTimeElapsed(0);
    setAnalysisStage("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50"
    >
      <div className="container py-8 space-y-8 px-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            Voice DNA Analysis
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        <AnimatePresence mode="wait">
          {!audioFile && (
            <RecordingPage 
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isLoading}
            />
          )}
          
          {audioFile && isLoading && (
            <AnalysisProgress 
              progress={analysisProgress}
              stage={analysisStage}
              timeElapsed={timeElapsed}
            />
          )}

          {analysisResults && !isLoading && (
            <AnalysisResults 
              results={analysisResults}
              onReset={resetAnalysis}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Demo;