import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisResults from "./demo/AnalysisResults";
import UploadSection from "./demo/UploadSection";

const DialogueDemo = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeAudio(file);
      console.log('Analysis results:', results);
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
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
            {!analysisResults ? (
              <UploadSection 
                onFileSelect={handleAnalysis}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <AnalysisResults 
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