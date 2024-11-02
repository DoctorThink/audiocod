import { useState } from "react";
import { Upload, Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { analyzeAudio } from "@/services/audioAnalysis";
import { Progress } from "@/components/ui/progress";

const Demo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: analysisResult, refetch: runAnalysis, isLoading } = useQuery({
    queryKey: ['audioAnalysis', file?.name],
    queryFn: async () => {
      if (!file) throw new Error('No file selected');
      return analyzeAudio(file);
    },
    enabled: false
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== "audio/mpeg") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an MP3 file"
        });
        return;
      }
      setFile(uploadedFile);
      const audio = new Audio(URL.createObjectURL(uploadedFile));
      setAudioElement(audio);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary-900">
          AI Audio Analysis
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
                        onClick={togglePlayback}
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
                    onClick={() => runAnalysis()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {analysisResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 font-mono text-sm animate-fade-in space-y-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-900">Speaker Analysis</h2>
                {analysisResult.speakers.map((speaker) => (
                  <div key={speaker.id} className="space-y-4 p-4 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-800 font-semibold">
                          Speaker {speaker.id}
                        </p>
                        <p className="text-gray-600">
                          {speaker.gender}, {speaker.ageRange} years
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-500">Confidence: {speaker.confidence}%</p>
                        <p className="text-gray-500">Clarity: {speaker.clarity}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-primary-600 italic">"{speaker.speech}"</p>
                    </div>

                    <div>
                      <p className="mb-2 text-gray-700">Emotional State:</p>
                      <div className="space-y-2">
                        {Object.entries(speaker.emotionalState).map(([emotion, value]) => (
                          <div key={emotion} className="flex items-center gap-2">
                            <span className="w-16 text-gray-600 capitalize">{emotion}</span>
                            <Progress value={value * 100} className="h-2" />
                            <span className="text-gray-500 w-12 text-right">{(value * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary-900">Audio Quality Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-gray-600 mb-2">Quality Score</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {analysisResult.audioQuality.score}/100
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-gray-600 mb-2">Signal-to-Noise Ratio</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {analysisResult.audioQuality.signalToNoiseRatio.toFixed(1)} dB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary-900">Dialogue Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-gray-600">Duration</p>
                    <p className="text-xl font-bold text-primary-500">
                      {analysisResult.dialogueStatistics.totalDuration.toFixed(1)}s
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-gray-600">Turn Count</p>
                    <p className="text-xl font-bold text-primary-500">
                      {analysisResult.dialogueStatistics.turnCount}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-gray-600">Overlap Count</p>
                    <p className="text-xl font-bold text-primary-500">
                      {analysisResult.dialogueStatistics.overlapCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;