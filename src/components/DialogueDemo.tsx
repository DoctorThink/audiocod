import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

const DialogueDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Experience DialogueVox
        </h2>
        
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
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
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Emma</p>
              <p className="text-gray-800">"Hey David, thanks for meeting me here on such short notice."</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">David</p>
              <p className="text-gray-800">"N-no problem at all. I've been looking f-forward to discussing this actually."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueDemo;