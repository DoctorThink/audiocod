import { extractAudioFeatures } from './emotionFeatureExtractor';
import { emotionModel } from './emotionModel';
import type { EmotionPrediction } from './emotionModel';

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
  
  // Extract advanced audio features
  const features = await extractAudioFeatures(audioData, audioBuffer.sampleRate);
  
  // Initialize and warm up the model
  await emotionModel.initialize();
  
  // Get emotion predictions
  const emotions = await emotionModel.predict(features);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidence(emotions);
  
  // Generate time series data
  const timeSeriesData = generateTimeSeriesData(features, audioBuffer.sampleRate);
  
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

const generateTimeSeriesData = (
  features: any,
  sampleRate: number
): Array<{ time: number; pitch: number; energy: number }> => {
  const hopSize = 512; // Standard hop size for audio analysis
  return features.pitch.map((pitch: number, i: number) => ({
    time: (i * hopSize) / sampleRate,
    pitch,
    energy: features.energy[i]
  }));
};