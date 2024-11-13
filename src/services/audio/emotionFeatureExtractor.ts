import * as tf from '@tensorflow/tfjs';

export interface AudioFeatures {
  pitch: number[];
  energy: number[];
  spectralFeatures: Float32Array;
  tempo: number;
}

export const extractAudioFeatures = async (
  audioData: Float32Array,
  sampleRate: number
): Promise<AudioFeatures> => {
  const frameSize = 2048;
  const hopSize = 512;
  const frames = [];
  
  // Frame the audio data
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    frames.push(audioData.slice(i, i + frameSize));
  }
  
  // Convert frames to tensor
  const frameTensor = tf.tensor2d(frames);
  
  // Apply FFT
  const spectrogramTensor = tf.abs(tf.spectral.rfft(frameTensor));
  const spectrogram = await spectrogramTensor.array() as number[][];
  
  // Extract features
  const pitch = extractPitch(frames, sampleRate);
  const energy = calculateEnergy(frames);
  const spectralFeatures = calculateSpectralFeatures(spectrogram);
  const tempo = calculateTempo(energy, sampleRate, hopSize);
  
  // Cleanup tensors
  tf.dispose([frameTensor, spectrogramTensor]);
  
  return {
    pitch,
    energy,
    spectralFeatures,
    tempo
  };
};

const extractPitch = (frames: Float32Array[], sampleRate: number): number[] => {
  return frames.map(frame => {
    const acf = autocorrelation(frame);
    return findPitch(acf, sampleRate);
  });
};

const autocorrelation = (frame: Float32Array): Float32Array => {
  const result = new Float32Array(frame.length);
  for (let lag = 0; lag < frame.length; lag++) {
    let sum = 0;
    for (let n = 0; n < frame.length - lag; n++) {
      sum += frame[n] * frame[n + lag];
    }
    result[lag] = sum;
  }
  return result;
};

const findPitch = (acf: Float32Array, sampleRate: number): number => {
  let maxCorr = -Infinity;
  let pitch = 0;
  for (let lag = 30; lag < acf.length / 2; lag++) {
    if (acf[lag] > maxCorr) {
      maxCorr = acf[lag];
      pitch = sampleRate / lag;
    }
  }
  return pitch;
};

const calculateEnergy = (frames: Float32Array[]): number[] => {
  return frames.map(frame => {
    return frame.reduce((sum, val) => sum + val * val, 0) / frame.length;
  });
};

const calculateSpectralFeatures = (spectrogram: number[][]): Float32Array => {
  const numMelBands = 40;
  const features = new Float32Array(numMelBands);
  
  for (let i = 0; i < numMelBands; i++) {
    let sum = 0;
    for (let j = 0; j < spectrogram.length; j++) {
      const binIndex = Math.floor((i / numMelBands) * spectrogram[j].length);
      sum += spectrogram[j][binIndex];
    }
    features[i] = sum / spectrogram.length;
  }
  
  return features;
};

const calculateTempo = (energy: number[], sampleRate: number, hopSize: number): number => {
  let peaks = 0;
  for (let i = 1; i < energy.length - 1; i++) {
    if (energy[i] > energy[i - 1] && energy[i] > energy[i + 1]) {
      peaks++;
    }
  }
  
  const duration = (energy.length * hopSize) / sampleRate;
  return (peaks / duration) * 60;
};