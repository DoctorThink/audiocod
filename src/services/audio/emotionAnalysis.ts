import * as tf from '@tensorflow/tfjs';
import { EmotionAnalysisService } from './emotionAnalysisService';
import { VoiceParameters } from '@/types/emotionAnalysis';

const emotionAnalysisService = new EmotionAnalysisService();

export const calculateEmotions = async (
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>,
  spectralFeatures: Float32Array
) => {
  // Extract voice parameters from the data
  const voiceParams = extractVoiceParameters(timeSeriesData);
  
  // Analyze emotions using our service
  const emotionalState = emotionAnalysisService.analyzeVoiceParameters(voiceParams);
  
  return emotionalState.confidence;
};

const extractVoiceParameters = (
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>
): VoiceParameters => {
  const pitches = timeSeriesData.map(d => d.pitch);
  const energies = timeSeriesData.map(d => d.energy);
  
  return {
    voiceQuality: calculateVoiceQuality(timeSeriesData),
    clarity: calculateClarity(timeSeriesData),
    stability: calculateStability(timeSeriesData),
    averagePitch: mean(pitches),
    pitchRange: [Math.min(...pitches), Math.max(...pitches)],
    energyLevel: mean(energies),
    timeSeriesPitch: pitches,
    timeSeriesEnergy: energies
  };
};

// Helper functions
function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  const meanValue = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - meanValue, 2));
  return Math.sqrt(mean(squareDiffs));
}

function calculateVoiceQuality(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const energies = data.map(d => d.energy);
  const pitches = data.map(d => d.pitch);
  
  const energyStability = 1 - std(energies);
  const pitchStability = 1 - std(pitches) / mean(pitches);
  
  return (energyStability + pitchStability) / 2;
}

function calculateClarity(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const energies = data.map(d => d.energy);
  return mean(energies);
}

function calculateStability(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const pitches = data.map(d => d.pitch);
  return 1 - (std(pitches) / mean(pitches));
}