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
  // Convert blob to array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const audioData = audioBuffer.getChannelData(0);
  
  // Extract features
  const features = await extractAudioFeatures(audioData, audioBuffer.sampleRate);
  
  // Get emotion predictions
  const emotions = await emotionModel.predict(features);
  
  // Calculate confidence based on prediction distribution
  const confidenceScore = calculateConfidence(emotions);
  
  // Prepare time series data
  const timeSeriesData = features.pitch.map((pitch, i) => ({
    time: i * (512 / audioBuffer.sampleRate), // Using hopSize of 512
    pitch,
    energy: features.energy[i]
  }));
  
  // Store analysis in Supabase
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
  
  // Confidence is higher when one emotion dominates
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
      emotion_scores: analysis.emotions,
      spectral_features: Array.from(analysis.features.spectralFeatures),
      pitch_mean: analysis.timeSeriesData.reduce((sum, data) => sum + data.pitch, 0) / analysis.timeSeriesData.length,
      energy_level: analysis.timeSeriesData.reduce((sum, data) => sum + data.energy, 0) / analysis.timeSeriesData.length,
      tempo: analysis.features.tempo
    });
  
  if (error) {
    console.error('Error storing analysis:', error);
  }
};