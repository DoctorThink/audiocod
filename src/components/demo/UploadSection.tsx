import { useState } from "react";
import { Loader2, Mic, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import AudioPlayer from "./AudioPlayer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadSection = ({ onFileSelect, isAnalyzing }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-primary-100 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          {!file ? (
            <div className="w-full space-y-4">
              <label 
                htmlFor="audio-upload"
                className="block w-full p-8 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-primary-50/30"
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-primary-400 mb-2" />
                  <span className="text-base text-primary-600 font-medium text-center">
                    Drop MP3 file here or tap to upload
                  </span>
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
                className="w-full py-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md text-lg"
              >
                <Mic className="w-5 h-5 mr-2" />
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
                className="w-full py-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md text-lg"
                onClick={() => onFileSelect(file)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Audio...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;