import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisResults from "./demo/AnalysisResults";
import UploadSection from "./demo/UploadSection";
import AnalysisProgress from "./demo/AnalysisProgress";
import type { AnalysisResult } from "@/services/audioAnalysis";

const DialogueDemo = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const handleAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Starting analysis for file:', file.name);
      const results = await analyzeAudio(file);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      console.log('Analysis results:', results);
      if (!results) {
        throw new Error("Analysis failed to return results");
      }
      
      setAnalysisResults(results);
      toast({
        title: "Analysis complete",
        description: "Your audio has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
      });
      setAnalysisResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setAnalysisProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 mb-3 sm:mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Voice Analysis
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Upload your audio for advanced AI-powered analysis
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {!analysisResults && !isAnalyzing && (
              <UploadSection 
                key="upload"
                onFileSelect={handleAnalysis}
                isAnalyzing={isAnalyzing}
              />
            )}

            {isAnalyzing && (
              <AnalysisProgress 
                key="progress"
                progress={analysisProgress}
                stage={analysisProgress < 30 ? "Processing audio..." : 
                       analysisProgress < 60 ? "Analyzing patterns..." : 
                       analysisProgress < 90 ? "Generating insights..." : 
                       "Finalizing analysis..."}
                timeElapsed={0}
              />
            )}

            {analysisResults && !isAnalyzing && (
              <AnalysisResults 
                key="results"
                results={analysisResults}
                onReset={resetAnalysis}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DialogueDemo;