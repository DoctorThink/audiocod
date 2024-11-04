export interface VoiceCharacteristics {
  pitchMean: number;
  pitchRange: [number, number];
  voiceQuality: number;
  clarity: number;
  stability: number;
}

export function calculateVoiceCharacteristics(timeSeriesData: Array<{ pitch: number; energy: number }>): VoiceCharacteristics {
  if (!timeSeriesData.length) {
    return {
      pitchMean: 0,
      pitchRange: [0, 0],
      voiceQuality: 0.5,
      clarity: 0.5,
      stability: 0.5
    };
  }

  const pitches = timeSeriesData.map(d => d.pitch);
  const energies = timeSeriesData.map(d => d.energy);
  
  const pitchMean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const pitchMin = Math.min(...pitches);
  const pitchMax = Math.max(...pitches);
  
  const energyMean = Math.max(0.001, energies.reduce((a, b) => a + b, 0) / energies.length);
  const energyVariance = Math.max(0.001, energies.reduce((a, b) => a + Math.pow(b - energyMean, 2), 0) / energies.length);
  
  const pitchVariance = Math.max(0.001, pitches.reduce((a, b) => a + Math.pow(b - pitchMean, 2), 0) / pitches.length);
  
  // Normalize values between 0 and 1
  const stability = Number((1 / (1 + pitchVariance)).toFixed(3));
  const clarity = Number((1 / (1 + energyVariance)).toFixed(3));
  
  const voiceQuality = Number((
    clarity * 0.4 +
    stability * 0.3 +
    Math.min(1, energyMean) * 0.3
  ).toFixed(3));
  
  return {
    pitchMean,
    pitchRange: [pitchMin, pitchMax],
    voiceQuality,
    clarity,
    stability
  };
}