import { emotionClassifier, type EmotionPrediction } from './emotionClassifier';

export const calculateEmotions = async (
  timeSeriesData: Array<{ pitch: number; energy: number }>,
  spectralFeatures: Float32Array
): Promise<EmotionPrediction> => {
  // Extract relevant features
  const avgPitch = timeSeriesData.reduce((sum, data) => sum + data.pitch, 0) / timeSeriesData.length;
  const avgEnergy = timeSeriesData.reduce((sum, data) => sum + data.energy, 0) / timeSeriesData.length;
  
  // Calculate tempo from energy variations
  const energyVariations = timeSeriesData.map(data => data.energy);
  const tempo = calculateTempo(energyVariations);
  
  // Calculate clarity and stability
  const clarity = calculateClarity(spectralFeatures);
  const stability = calculateStability(timeSeriesData.map(data => data.pitch));
  
  // Normalize features
  const normalizedFeatures = [
    avgPitch / 500, // Normalize pitch (assuming max pitch around 500Hz)
    avgEnergy,
    tempo / 200, // Normalize tempo (assuming max tempo around 200 BPM)
    clarity,
    stability
  ];
  
  return await emotionClassifier.predict(normalizedFeatures);
};

function calculateTempo(energyVariations: number[]): number {
  // Simple tempo estimation from energy variations
  let peakCount = 0;
  for (let i = 1; i < energyVariations.length - 1; i++) {
    if (energyVariations[i] > energyVariations[i - 1] && 
        energyVariations[i] > energyVariations[i + 1]) {
      peakCount++;
    }
  }
  return (peakCount * 60) / (energyVariations.length / 44100); // Assuming 44.1kHz sample rate
}

function calculateClarity(spectralFeatures: Float32Array): number {
  // Calculate clarity from spectral features
  const sum = Array.from(spectralFeatures).reduce((a, b) => a + b, 0);
  const mean = sum / spectralFeatures.length;
  const variance = Array.from(spectralFeatures)
    .reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / spectralFeatures.length;
  return 1 / (1 + variance); // Normalize to 0-1 range
}

function calculateStability(pitchValues: number[]): number {
  // Calculate pitch stability
  const mean = pitchValues.reduce((a, b) => a + b, 0) / pitchValues.length;
  const variance = pitchValues
    .reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / pitchValues.length;
  return 1 / (1 + variance); // Normalize to 0-1 range
}