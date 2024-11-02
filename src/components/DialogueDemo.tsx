import { useState } from "react";
import { Upload, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

const DialogueDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "audio/mpeg") {
      setFile(uploadedFile);
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
                  onClick={() => {
                    // Analysis logic would go here
                    console.log("Analyzing file:", file.name);
                  }}
                >
                  Start Analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueDemo;