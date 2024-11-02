interface Speaker {
  id: number;
  gender: string;
  ageRange: string;
  confidence: number;
  speech: string;
  clarity: number;
  emotionalState: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
  };
}

interface AudioAnalysisResult {
  speakers: Speaker[];
  audioQuality: {
    score: number;
    signalToNoiseRatio: number;
    duration: number;
  };
  backgroundNoise: number;
  dialogueStatistics: {
    totalDuration: number;
    speakerCount: number;
    turnCount: number;
    averageTurnLength: number;
    overlapCount: number;
  };
}

export const analyzeAudio = async (audioFile: File): Promise<AudioAnalysisResult> => {
  // This would normally make an API call to your Python backend
  // For now, we'll simulate the analysis with mock data
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

  return {
    speakers: [
      {
        id: 1,
        gender: "male",
        ageRange: "30-40",
        confidence: 92,
        speech: "This quarterly report shows significant progress.",
        clarity: 95,
        emotionalState: {
          neutral: 0.8,
          happy: 0.1,
          sad: 0.0,
          angry: 0.0,
          fearful: 0.1
        }
      },
      {
        id: 2,
        gender: "female",
        ageRange: "25-35",
        confidence: 89,
        speech: "I agree, the metrics are very promising.",
        clarity: 92,
        emotionalState: {
          neutral: 0.2,
          happy: 0.7,
          sad: 0.0,
          angry: 0.0,
          fearful: 0.1
        }
      }
    ],
    audioQuality: {
      score: 88,
      signalToNoiseRatio: 35.6,
      duration: 45.2
    },
    backgroundNoise: 0.2,
    dialogueStatistics: {
      totalDuration: 45.2,
      speakerCount: 2,
      turnCount: 4,
      averageTurnLength: 11.3,
      overlapCount: 1
    }
  };
};