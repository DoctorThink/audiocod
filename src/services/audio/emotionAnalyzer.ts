import { extractAudioFeatures } from './emotionFeatureExtractor';
import { emotionModel } from './emotionModel';
import type { EmotionPrediction } from './emotionModel';
import { supabase } from '@/integrations/supabase/client';

export interface EmotionAnalysis {
  emotions: EmotionPrediction;
  confidence: number;
  timeSeriesData: Array<{
    time: number;
    pitch: number;
    energy: number;
  }>;
}

export const analyzeAudioEmotion = async (audioBlob: Blob): Promise<EmotionAnalysis> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const audioData = audioBuffer.getChannelData(0);
  
  const features = await extractAudioFeatures(audioData, audioBuffer.sampleRate);
  const emotions = await emotionModel.predict(features);
  const confidenceScore = calculateConfidence(emotions);
  
  const timeSeriesData = features.pitch.map((pitch, i) => ({
    time: i * (512 / audioBuffer.sampleRate),
    pitch,
    energy: features.energy[i]
  }));
  
  await storeAnalysis({
    emotions,
    features,
    timeSeriesData
  });
  
  return {
    emotions,
    confidence: confidenceScore,
    timeSeriesData
  };
};

const calculateConfidence = (emotions: EmotionPrediction): number => {
  const values = Object.values(emotions);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  return (max / sum) * 100;
};

const storeAnalysis = async (analysis: {
  emotions: EmotionPrediction;
  features: any;
  timeSeriesData: any[];
}) => {
  const { error } = await supabase
    .from('audio_analyses')
    .insert({
      emotion_scores: JSON.stringify(analysis.emotions),
      spectral_features: Array.from(analysis.features.spectralFeatures),
      pitch_mean: analysis.timeSeriesData.reduce((sum, data) => sum + data.pitch, 0) / analysis.timeSeriesData.length,
      energy_level: analysis.timeSeriesData.reduce((sum, data) => sum + data.energy, 0) / analysis.timeSeriesData.length,
      tempo: analysis.features.tempo,
      file_path: 'temp'
    });
  
  if (error) {
    console.error('Error storing analysis:', error);
  }
};