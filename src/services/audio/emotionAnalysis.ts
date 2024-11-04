interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
}

export function calculateEmotions(timeSeriesData: Array<{ pitch: number; energy: number }>): EmotionScores {
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
  const energies = timeSeriesData.map(d => d.energy);
  
  const pitchMean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const energyMean = Math.max(0.001, energies.reduce((a, b) => a + b, 0) / energies.length);
  
  const pitchVariance = Math.max(0.001, pitches.reduce((a, b) => a + Math.pow(b - pitchMean, 2), 0) / pitches.length);
  const energyVariance = Math.max(0.001, energies.reduce((a, b) => a + Math.pow(b - energyMean, 2), 0) / energies.length);
  
  const happy = Math.min(
    1,
    Math.max(0.1, (energyMean * 0.6 + (1 / pitchVariance) * 0.4) * 
    (pitchMean > pitches[0] ? 1.2 : 0.8))
  );
  
  const angry = Math.min(
    1,
    Math.max(0.1, (energyVariance * 0.7 + energyMean * 0.3) * 
    (pitchVariance > 0.3 ? 1.3 : 0.7))
  );
  
  const sad = Math.min(
    1,
    Math.max(0.1, ((1 - energyMean) * 0.5 + (1 - pitchMean / Math.max(...pitches)) * 0.5) *
    (pitchMean < pitches[0] ? 1.2 : 0.8))
  );
  
  const fearful = Math.min(
    1,
    Math.max(0.1, (pitchVariance * 0.6 + (1 - energyMean) * 0.4) *
    (energyVariance > 0.3 ? 1.2 : 0.8))
  );
  
  const emotionSum = happy + angry + sad + fearful;
  const neutral = Math.max(0.1, 1 - emotionSum / 4);
  
  const total = neutral + happy + sad + angry + fearful;
  
  return {
    neutral: Number((neutral / total).toFixed(3)),
    happy: Number((happy / total).toFixed(3)),
    sad: Number((sad / total).toFixed(3)),
    angry: Number((angry / total).toFixed(3)),
    fearful: Number((fearful / total).toFixed(3))
  };
}