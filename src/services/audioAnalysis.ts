import { supabase } from "@/integrations/supabase/client";
import { analyzeAudioEmotion } from "./audio/emotionAnalyzer";
import { calculateVoiceCharacteristics } from "./audio/voiceCharacteristics";
import type { EmotionPrediction } from "./audio/emotionModel";
import type { Json } from "@/integrations/supabase/types";

export interface AnalysisResult {
  speakerProfile: {
    id: string;
    confidence: number;
    characteristics: {
      voiceQuality: number;
      clarity: number;
      stability: number;
      pitchMean: number;
      pitchRange: [number, number];
    };
  };
  emotions: EmotionPrediction;
  timeSeriesData: Array<{
    time: number;
    pitch: number;
    energy: number;
  }>;
}

export const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio file');
  }

  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    const filename = `${crypto.randomUUID()}.mp3`;
    console.log('Processing file:', filename);
    
    // Upload file and process audio in parallel
    const [uploadResult, audioBuffer] = await Promise.all([
      supabase.storage
        .from('audio-files')
        .upload(filename, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: false
        }),
      audioBlob.arrayBuffer().then(buffer => 
        new AudioContext().decodeAudioData(buffer)
      )
    ]);

    if (uploadResult.error) {
      console.error('Upload error:', uploadResult.error);
      throw uploadResult.error;
    }

    const audioData = audioBuffer.getChannelData(0);
    console.log('Audio data processed, starting analysis');

    // Analyze emotions and characteristics in parallel
    const emotionAnalysis = await analyzeAudioEmotion(audioBlob);
    const voiceCharacteristics = calculateVoiceCharacteristics(emotionAnalysis.timeSeriesData);

    // Prepare analysis result
    const result: AnalysisResult = {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: emotionAnalysis.confidence,
        characteristics: voiceCharacteristics
      },
      emotions: emotionAnalysis.emotions,
      timeSeriesData: emotionAnalysis.timeSeriesData.map((data, index) => ({
        time: index / 100,
        pitch: data.pitch || 0,
        energy: data.energy || 0
      }))
    };

    // Store results asynchronously
    const emotionScores: Record<string, number> = {};
    Object.entries(result.emotions).forEach(([key, value]) => {
      emotionScores[key] = value;
    });

    supabase
      .from('audio_analyses')
      .insert({
        file_path: filename,
        emotion_scores: emotionScores as Json,
        pitch_mean: voiceCharacteristics.pitchMean,
        pitch_range: voiceCharacteristics.pitchRange,
        energy_level: result.timeSeriesData[0].energy,
        spectral_features: Array.from(new Float32Array(32)),
        tempo: 120
      })
      .then(({ error: dbError }) => {
        if (dbError) {
          console.error('Database error:', dbError);
        } else {
          console.log('Analysis results stored successfully');
        }
      });

    console.log('Analysis completed successfully');
    return result;
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during audio analysis');
  }
};