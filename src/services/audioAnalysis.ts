import { supabase } from "@/integrations/supabase/client";
import { analyzeAudioEmotion } from "./audio/emotionAnalyzer";
import { calculateVoiceCharacteristics } from "./audio/voiceCharacteristics";
import type { EmotionPrediction } from "./audio/emotionModel";
import type { Json } from "@/integrations/supabase/types";

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

    // Process audio data
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const audioData = audioBuffer.getChannelData(0);

    // Analyze emotions using the enhanced model
    const emotionAnalysis = await analyzeAudioEmotion(audioBlob);
    const voiceCharacteristics = calculateVoiceCharacteristics(emotionAnalysis.timeSeriesData);

    // Create analysis result
    const result: AnalysisResult = {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: emotionAnalysis.confidence,
        characteristics: voiceCharacteristics
      },
      emotions: emotionAnalysis.emotions,
      timeSeriesData: emotionAnalysis.timeSeriesData.map((data, index) => ({
        time: index / 100, // Convert to seconds
        pitch: data.pitch || 0,
        energy: data.energy || 0
      }))
    };

    // Convert emotions to a JSON-compatible object
    const emotionScores = Object.entries(result.emotions).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as Record<string, number>
    );

    // Store analysis results
    const { error: dbError } = await supabase
      .from('audio_analyses')
      .insert({
        file_path: filename,
        emotion_scores: emotionScores,
        pitch_mean: voiceCharacteristics.pitchMean,
        pitch_range: voiceCharacteristics.pitchRange,
        energy_level: result.timeSeriesData[0].energy,
        spectral_features: Array.from(new Float32Array(32)), // Placeholder for spectral features
        tempo: 120 // Default tempo
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return result;
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during audio analysis');
  }
};