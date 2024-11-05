import { Upload, Waveform } from "lucide-react";
import { motion } from "framer-motion";

interface AudioUploaderProps {
  file: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudioUploader = ({ file, onFileUpload }: AudioUploaderProps) => {
  return (
    <label 
      htmlFor="audio-upload"
      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-primary-50/30 group"
    >
      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Upload className="w-10 h-10 text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-primary-600 font-medium">Drop MP3 file here or click to upload</span>
          <span className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</span>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Waveform className="w-8 h-8 text-primary-500" />
          <span className="text-primary-600 font-medium">{file.name}</span>
        </motion.div>
      )}
      <input
        id="audio-upload"
        type="file"
        accept=".mp3,audio/mpeg"
        className="hidden"
        onChange={onFileUpload}
      />
    </label>
  );
};

export default AudioUploader;