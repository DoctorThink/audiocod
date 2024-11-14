import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, Upload } from "lucide-react";
import { motion } from "framer-motion";
import AudioRecorder from "../audio/AudioRecorder";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadSection = ({ onFileSelect, isAnalyzing }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > 5 * 1024 * 1024) {
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
    onFileSelect(uploadedFile);
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-primary-100 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
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
                disabled={isAnalyzing}
              />
            </label>
            <div className="text-center text-gray-500">or</div>
            <AudioRecorder
              onRecordingComplete={(blob) => {
                const file = new File([blob], "recording.mp3", { type: "audio/mpeg" });
                setFile(file);
                onFileSelect(file);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;