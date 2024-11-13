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
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('audio-files')
      .upload(filename, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Analyze emotions
    const emotionAnalysis = await analyzeAudioEmotion(audioBlob);
    
    // Calculate voice characteristics
    const characteristics = calculateVoiceCharacteristics(emotionAnalysis.timeSeriesData);

    // Create mock data for testing
    const mockResult: AnalysisResult = {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: 0.85,
        characteristics: {
          voiceQuality: 0.75,
          clarity: 0.9,
          stability: 0.8,
          pitchMean: 220,
          pitchRange: [180, 260]
        }
      },
      emotions: {
        neutral: 0.2,
        happy: 0.4,
        sad: 0.1,
        angry: 0.2,
        fearful: 0.1
      },
      timeSeriesData: Array.from({ length: 50 }, (_, i) => ({
        time: i * 0.1,
        pitch: 220 + Math.sin(i * 0.2) * 20,
        energy: 0.5 + Math.cos(i * 0.3) * 0.3
      }))
    };

    // Store analysis results in database
    const { error: dbError } = await supabase
      .from('audio_analyses')
      .insert({
        file_path: filename,
        emotion_scores: mockResult.emotions,
        pitch_mean: mockResult.speakerProfile.characteristics.pitchMean,
        pitch_range: mockResult.speakerProfile.characteristics.pitchRange,
        energy_level: mockResult.timeSeriesData[0].energy
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return mockResult;
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during audio analysis');
  }
};