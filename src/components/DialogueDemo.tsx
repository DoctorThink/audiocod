import { useState } from "react";
import { Upload, Play, Pause, Volume2, Loader2, Mic, Waveform } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import EmotionChart from "./audio/EmotionChart";
import VoiceMetrics from "./audio/VoiceMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";

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
    <div className="bg-gradient-to-b from-gray-50 to-white py-20">
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

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6">
                <label 
                  htmlFor="audio-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-primary-50/30"
                >
                  {!file ? (
                    <>
                      <Upload className="w-10 h-10 text-primary-400 mb-2" />
                      <span className="text-sm text-primary-600 font-medium">Drop MP3 file here or click to upload</span>
                      <span className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Waveform className="w-8 h-8 text-primary-500" />
                      <span className="text-primary-600 font-medium">{file.name}</span>
                    </div>
                  )}
                  <input
                    id="audio-upload"
                    type="file"
                    accept=".mp3,audio/mpeg"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {file && (
                  <div className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-12 h-12 rounded-full"
                        >
                          {isPlaying ? 
                            <Pause className="w-6 h-6 text-primary-500" /> : 
                            <Play className="w-6 h-6 text-primary-500" />
                          }
                        </Button>
                        <div className="flex space-x-1">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-primary-400 rounded-full"
                              animate={{
                                height: isPlaying ? [20, 40, 20] : 20
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: isPlaying ? Infinity : 0,
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <Volume2 className="w-6 h-6 text-gray-400" />
                    </div>

                    <Button 
                      className="w-full"
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

          <AnimatePresence>
            {analysisResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <VoiceMetrics speakerProfile={analysisResults.speakerProfile} />
                      <EmotionChart emotions={analysisResults.emotions} />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Voice Quality Metrics</h3>
                      <div className="space-y-6">
                        {Object.entries(analysisResults.speakerProfile.characteristics).map(([key, value]: [string, number]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span>{typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value}</span>
                            </div>
                            <Progress value={typeof value === 'number' ? value * 100 : 0} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DialogueDemo;