import { AudioWaveform, Users, Brain, FileAudio } from "lucide-react";

const features = [
  {
    icon: <FileAudio className="w-8 h-8" />,
    title: "MP3 Upload & Analysis",
    description: "Upload your audio files for comprehensive voice and speech pattern analysis"
  },
  {
    icon: <AudioWaveform className="w-8 h-8" />,
    title: "Audio Pattern Detection",
    description: "Advanced algorithms detect speech patterns, voice characteristics, and audio quality metrics"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Speaker Recognition",
    description: "Identify and distinguish multiple speakers within your audio recordings"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Smart Transcription",
    description: "AI-powered transcription with speaker labeling and conversation flow analysis"
  }
];

const Features = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Audio Analysis Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-primary-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;