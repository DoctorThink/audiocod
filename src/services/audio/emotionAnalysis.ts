import { AdvancedEmotionAnalyzer } from './advancedEmotionAnalyzer';

const emotionAnalyzer = new AdvancedEmotionAnalyzer();

export const calculateEmotions = async (
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>,
  spectralFeatures: Float32Array
) => {
  // Extract metrics from time series data
  const metrics = {
    voiceQuality: calculateVoiceQuality(timeSeriesData),
    clarity: calculateClarity(timeSeriesData),
    stability: calculateStability(timeSeriesData),
    pitch: calculateAveragePitch(timeSeriesData),
    energy: calculateAverageEnergy(timeSeriesData)
  };

  // Analyze emotions using our advanced analyzer
  const emotionalState = emotionAnalyzer.analyze(metrics);
  return emotionalState.confidence;
};

// Helper functions
function calculateVoiceQuality(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const energies = data.map(d => d.energy);
  const pitches = data.map(d => d.pitch);
  
  const energyStability = 1 - calculateStandardDeviation(energies);
  const pitchStability = 1 - calculateStandardDeviation(pitches) / calculateMean(pitches);
  
  return (energyStability + pitchStability) / 2 * 100;
}

function calculateClarity(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const energies = data.map(d => d.energy);
  return calculateMean(energies) * 100;
}

function calculateStability(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const pitches = data.map(d => d.pitch);
  return (1 - calculateStandardDeviation(pitches) / calculateMean(pitches)) * 100;
}

function calculateAveragePitch(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const pitches = data.map(d => d.pitch);
  return calculateMean(pitches);
}

function calculateAverageEnergy(data: Array<{ time: number; pitch: number; energy: number }>): number {
  const energies = data.map(d => d.energy);
  return calculateMean(energies);
}

function calculateMean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateStandardDeviation(arr: number[]): number {
  const mean = calculateMean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
}