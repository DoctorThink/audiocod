import { useState } from "react";
import { Loader2, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import AudioUploader from "./demo/AudioUploader";
import AudioPlayer from "./demo/AudioPlayer";
import AnalysisResults from "./demo/AnalysisResults";

const DialogueDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "audio/mpeg") {
      setFile(uploadedFile);
      toast({
        title: "File uploaded successfully",
        description: "Your audio file is ready for analysis.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload an MP3 file.",
      });
    }
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

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-900 mb-4">
              Voice Analysis Studio
            </h2>
            <p className="text-xl text-gray-600">
              Upload your audio for advanced AI-powered analysis
            </p>
          </div>

          <Card className="mb-8 bg-white/50 backdrop-blur-sm border-primary-100">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6">
                <AudioUploader file={file} onFileUpload={handleFileUpload} />

                {file && (
                  <div className="w-full space-y-6">
                    <AudioPlayer 
                      isPlaying={isPlaying} 
                      onPlayPause={() => setIsPlaying(!isPlaying)} 
                    />

                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white"
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

          <AnalysisResults results={analysisResults} />
        </motion.div>
      </div>
    </div>
  );
};

export default DialogueDemo;