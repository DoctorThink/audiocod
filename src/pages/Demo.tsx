import { useState } from "react";
import { Upload, Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AnalysisResult {
  speakers: {
    id: number;
    gender: string;
    ageRange: string;
    confidence: number;
    speech: string;
    clarity: number;
  }[];
  audioQuality: number;
  backgroundNoise: number;
}

const Demo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: analysisResult, refetch: runAnalysis } = useQuery<AnalysisResult>({
    queryKey: ['audioAnalysis', file?.name],
    queryFn: async () => {
      if (!file) throw new Error('No file selected');

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('audio', file);

      // Simulate API call with mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis result
      return {
        speakers: [
          {
            id: 1,
            gender: 'male',
            ageRange: '30-40',
            confidence: 92,
            speech: "This quarterly report shows significant progress.",
            clarity: 95
          },
          {
            id: 2,
            gender: 'female',
            ageRange: '25-35',
            confidence: 89,
            speech: "I agree, the metrics are very promising.",
            clarity: 92
          }
        ],
        audioQuality: 88,
        backgroundNoise: 0.2
      };
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
          Audio Analysis Demo
        </h1>
        
        <div className="max-w-3xl mx-auto">
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
                  >
                    Start Analysis
                  </Button>
                </div>
              )}
            </div>
          </div>

          {analysisResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 font-mono text-sm animate-fade-in">
              <div className="space-y-4">
                {analysisResult.speakers.map((speaker) => (
                  <div key={speaker.id} className="space-y-2">
                    <p className="text-gray-800">
                      Speaker {speaker.id} &lt;voice: {speaker.gender}, age-range: {speaker.ageRange}, confidence: {speaker.confidence}%&gt; 
                      <span className="text-primary-600">"{speaker.speech}"</span>
                    </p>
                    <p className="text-gray-500">[speech_clarity: {speaker.clarity}%, background_noise: low]</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-primary-500">[Audio_Quality_Score: {analysisResult.audioQuality}/100]</p>
                <p className="text-primary-500">[Speaker_Recognition_Confidence: High]</p>
                <p className="text-primary-500">[Background_Noise_Level: {analysisResult.backgroundNoise}dB]</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;