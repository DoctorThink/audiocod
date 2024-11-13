import { supabase } from "@/integrations/supabase/client";
import { analyzeAudioEmotion } from "./audio/emotionAnalyzer";
import { calculateVoiceCharacteristics } from "./audio/voiceCharacteristics";
import type { EmotionPrediction } from "./audio/emotionModel";

export interface AnalysisResult {
  speakerProfile: {
    id: string;
    confidence: number;
    characteristics: ReturnType<typeof calculateVoiceCharacteristics>;
  };
  emotions: EmotionPrediction;
  timeSeriesData: Array<{
    time: number;
    pitch: number;
    energy: number;
  }>;
}

export const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    const filename = `${crypto.randomUUID()}.mp3`;
    
    // Upload audio file
    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filename, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Analyze emotions
    const emotionAnalysis = await analyzeAudioEmotion(audioBlob);
    
    // Calculate voice characteristics
    const characteristics = calculateVoiceCharacteristics(emotionAnalysis.timeSeriesData);

    return {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: emotionAnalysis.confidence,
        characteristics
      },
      emotions: emotionAnalysis.emotions,
      timeSeriesData: emotionAnalysis.timeSeriesData
    };
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during audio analysis');
  }
};