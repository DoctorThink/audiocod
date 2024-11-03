import { useState } from "react";
import { Upload, Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { analyzeAudio } from "@/services/audioAnalysis";
import EmotionChart from "./audio/EmotionChart";

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
        title: "File uploaded",
        description: "Your audio file is ready for analysis.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
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
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Analyze Your Audio
        </h2>
        
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md">
              <label 
                htmlFor="audio-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload MP3 file</span>
                <input
                  id="audio-upload"
                  type="file"
                  accept=".mp3,audio/mpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {file && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-400 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <div className="flex space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-primary-500 rounded-full transition-all duration-300 ${
                            isPlaying ? "animate-wave" : "h-4"
                          }`}
                          style={{
                            height: Math.random() * 24 + 8,
                            animationDelay: `${i * 0.1}s`
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
                      Analyzing...
                    </>
                  ) : (
                    "Start Analysis"
                  )}
                </Button>
              </div>
            )}

            {analysisResults && (
              <div className="w-full space-y-6 mt-8">
                <EmotionChart emotions={analysisResults.emotions} />
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Voice Characteristics</h3>
                  <div className="space-y-2">
                    <p>Pitch Mean: {analysisResults.speakerProfile.characteristics.pitchMean.toFixed(2)} Hz</p>
                    <p>Voice Quality: {(analysisResults.speakerProfile.characteristics.voiceQuality * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueDemo;