import { supabase } from "@/integrations/supabase/client";
import { analyzeEmotions } from "./audio/emotionsService";

export interface AnalysisResult {
  emotions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
  };
  transcription?: string;
  timeSeriesData: Array<{
    time: number;
    pitch: number;
    energy: number;
  }>;
  speakerProfile: {
    id: string;
    confidence: number;
    characteristics: {
      pitchMean: number;
      pitchRange: [number, number];
      voiceQuality: number;
    };
  };
}

export const analyzeAudio = async (file: File | Blob): Promise<AnalysisResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const emotions = await analyzeEmotions(arrayBuffer);

    // Generate mock time series data for visualization
    const timeSeriesData = Array(20).fill(0).map((_, i) => ({
      time: i * 0.5,
      pitch: 150 + Math.random() * 30,
      energy: 0.5 + Math.random() * 0.3
    }));

    return {
      emotions,
      timeSeriesData,
      speakerProfile: {
        id: 'SP' + Date.now(),
        confidence: 0.89,
        characteristics: {
          pitchMean: 165,
          pitchRange: [120, 210],
          voiceQuality: 0.85
        }
      }
    };
  } catch (error) {
    console.error('Error in audio analysis:', error);
    throw error;
  }
};