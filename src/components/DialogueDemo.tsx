import { useState } from "react";
import { Loader2, Mic, Upload, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "./demo/AudioPlayer";
import AnalysisResults from "./demo/AnalysisResults";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const DialogueDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an MP3 file smaller than 5MB.",
      });
      return;
    }

    if (uploadedFile.type !== "audio/mpeg") {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload an MP3 file.",
      });
      return;
    }

    setFile(uploadedFile);
    toast({
      title: "File uploaded successfully",
      description: "Your audio file is ready for analysis.",
    });
  };

  const handleAnalysis = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    try {
      const results = await analyzeAudio(file);
      setAnalysisResults(results);
      toast({
        title: "Analysis complete",
        description: "Your audio has been analyzed successfully.",
      });
    } catch (error) {
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
    setFile(null);
    setAnalysisResults(null);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.h2 
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Voice Analysis
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Upload your audio for advanced AI-powered analysis
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {!analysisResults ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 border-primary-100 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-6">
                      {!file ? (
                        <div className="w-full space-y-4">
                          <label 
                            htmlFor="audio-upload"
                            className="block w-full p-8 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-primary-50/30"
                          >
                            <div className="flex flex-col items-center">
                              <Upload className="w-12 h-12 text-primary-400 mb-2" />
                              <span className="text-sm text-primary-600 font-medium">Drop MP3 file here or click to upload</span>
                              <span className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</span>
                            </div>
                            <input
                              id="audio-upload"
                              type="file"
                              accept=".mp3,audio/mpeg"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <div className="text-center text-gray-500">or</div>
                          <Button 
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md"
                            onClick={() => {/* Add recording logic */}}
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Record Audio
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full space-y-6">
                          <AudioPlayer 
                            isPlaying={isPlaying} 
                            onPlayPause={() => setIsPlaying(!isPlaying)} 
                          />
                          <Button 
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md"
                            onClick={handleAnalysis}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing Audio...
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4 mr-2" />
                                Start Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalysisResults 
                  results={analysisResults} 
                  onReset={resetAnalysis}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DialogueDemo;