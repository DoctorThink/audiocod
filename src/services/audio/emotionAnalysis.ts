import * as tf from '@tensorflow/tfjs';

interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
}

// Emotion detection rules based on audio characteristics
const EMOTION_RULES = {
  happy: {
    pitchRange: [200, 400],
    energyThreshold: 0.6,
    tempoRange: [120, 180],
    spectralCentroidRange: [2000, 4000]
  },
  sad: {
    pitchRange: [100, 250],
    energyThreshold: 0.3,
    tempoRange: [60, 90],
    spectralCentroidRange: [500, 1500]
  },
  angry: {
    pitchRange: [150, 350],
    energyThreshold: 0.8,
    tempoRange: [140, 200],
    spectralCentroidRange: [3000, 5000]
  },
  fearful: {
    pitchRange: [200, 300],
    energyThreshold: 0.4,
    tempoRange: [100, 160],
    spectralCentroidRange: [1500, 3000]
  }
};

function calculateSpectralCentroid(spectralFeatures: Float32Array): number {
  let weightedSum = 0;
  let sum = 0;
  
  for (let i = 0; i < spectralFeatures.length; i++) {
    weightedSum += i * spectralFeatures[i];
    sum += spectralFeatures[i];
  }
  
  return sum === 0 ? 0 : weightedSum / sum;
}

function calculateTempo(timeSeriesData: Array<{ energy: number }>): number {
  const energies = timeSeriesData.map(d => d.energy);
  const correlations = new Float32Array(energies.length);
  
  // Auto-correlation to find tempo
  for (let lag = 0; lag < energies.length; lag++) {
    let sum = 0;
    for (let i = 0; i < energies.length - lag; i++) {
      sum += energies[i] * energies[i + lag];
    }
    correlations[lag] = sum;
  }
  
  // Find peaks in correlations
  const peaks = [];
  for (let i = 1; i < correlations.length - 1; i++) {
    if (correlations[i] > correlations[i - 1] && correlations[i] > correlations[i + 1]) {
      peaks.push(i);
    }
  }
  
  // Calculate tempo from peak intervals
  const averageInterval = peaks.length > 1 
    ? (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1)
    : 0;
  
  return averageInterval === 0 ? 120 : 60 / (averageInterval * 0.023); // Convert to BPM
}

function getEmotionScore(
  value: number,
  range: [number, number],
  inverse: boolean = false
): number {
  const normalized = (value - range[0]) / (range[1] - range[0]);
  const score = Math.max(0, Math.min(1, normalized));
  return inverse ? 1 - score : score;
}

export function calculateEmotions(
  timeSeriesData: Array<{ pitch: number; energy: number }>,
  spectralFeatures: Float32Array
): EmotionScores {
  if (!timeSeriesData.length) {
    return {
      neutral: 0.2,
      happy: 0.2,
      sad: 0.2,
      angry: 0.2,
      fearful: 0.2
    };
  }

  const pitches = timeSeriesData.map(d => d.pitch);
  const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const avgEnergy = timeSeriesData.reduce((a, b) => a + b.energy, 0) / timeSeriesData.length;
  const tempo = calculateTempo(timeSeriesData);
  const spectralCentroid = calculateSpectralCentroid(spectralFeatures);

  // Calculate individual emotion scores
  const scores = {
    happy: (
      getEmotionScore(avgPitch, EMOTION_RULES.happy.pitchRange) * 0.3 +
      getEmotionScore(avgEnergy, [0, EMOTION_RULES.happy.energyThreshold]) * 0.3 +
      getEmotionScore(tempo, EMOTION_RULES.happy.tempoRange) * 0.2 +
      getEmotionScore(spectralCentroid, EMOTION_RULES.happy.spectralCentroidRange) * 0.2
    ),
    sad: (
      getEmotionScore(avgPitch, EMOTION_RULES.sad.pitchRange, true) * 0.3 +
      getEmotionScore(avgEnergy, [0, EMOTION_RULES.sad.energyThreshold], true) * 0.3 +
      getEmotionScore(tempo, EMOTION_RULES.sad.tempoRange, true) * 0.2 +
      getEmotionScore(spectralCentroid, EMOTION_RULES.sad.spectralCentroidRange) * 0.2
    ),
    angry: (
      getEmotionScore(avgPitch, EMOTION_RULES.angry.pitchRange) * 0.25 +
      getEmotionScore(avgEnergy, [0, EMOTION_RULES.angry.energyThreshold]) * 0.35 +
      getEmotionScore(tempo, EMOTION_RULES.angry.tempoRange) * 0.2 +
      getEmotionScore(spectralCentroid, EMOTION_RULES.angry.spectralCentroidRange) * 0.2
    ),
    fearful: (
      getEmotionScore(avgPitch, EMOTION_RULES.fearful.pitchRange) * 0.3 +
      getEmotionScore(avgEnergy, [0, EMOTION_RULES.fearful.energyThreshold]) * 0.25 +
      getEmotionScore(tempo, EMOTION_RULES.fearful.tempoRange) * 0.25 +
      getEmotionScore(spectralCentroid, EMOTION_RULES.fearful.spectralCentroidRange) * 0.2
    )
  };

  // Calculate neutral score based on how close to average all other emotions are
  const emotionValues = Object.values(scores);
  const avgEmotionScore = emotionValues.reduce((a, b) => a + b, 0) / emotionValues.length;
  const emotionVariance = emotionValues.reduce((a, b) => a + Math.pow(b - avgEmotionScore, 2), 0) / emotionValues.length;
  const neutral = Math.max(0.1, 1 - emotionVariance);

  // Normalize scores
  const total = neutral + Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    neutral: Number((neutral / total).toFixed(3)),
    happy: Number((scores.happy / total).toFixed(3)),
    sad: Number((scores.sad / total).toFixed(3)),
    angry: Number((scores.angry / total).toFixed(3)),
    fearful: Number((scores.fearful / total).toFixed(3))
  };
}