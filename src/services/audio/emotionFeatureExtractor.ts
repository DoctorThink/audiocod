import * as tf from '@tensorflow/tfjs';

export interface AudioFeatures {
  pitch: number[];
  energy: number[];
  spectralFeatures: Float32Array;
  tempo: number;
}

export const extractAudioFeatures = async (audioData: Float32Array, sampleRate: number): Promise<AudioFeatures> => {
  const frameSize = 2048;
  const hopSize = 512;
  
  // Convert audio data to tensor
  const audioTensor = tf.tensor1d(audioData);
  
  try {
    // Apply windowing
    const hammingWindow = tf.signal.hammingWindow(frameSize);
    const frames = tf.signal.frame(audioTensor, frameSize, hopSize);
    const windowedFrames = tf.mul(frames, hammingWindow);
    
    // Compute spectrogram
    const spectrogramTensor = tf.abs(tf.spectral.rfft(windowedFrames));
    const spectrogram = await spectrogramTensor.array();
    
    // Extract pitch using autocorrelation
    const pitch = await extractPitch(audioData, sampleRate, frameSize, hopSize);
    
    // Calculate energy
    const energy = await calculateEnergy(audioData, frameSize, hopSize);
    
    // Extract spectral features
    const spectralFeatures = await extractSpectralFeatures(spectrogram);
    
    // Calculate tempo
    const tempo = calculateTempo(energy, sampleRate, hopSize);
    
    // Cleanup tensors
    tf.dispose([audioTensor, hammingWindow, frames, windowedFrames, spectrogramTensor]);
    
    return {
      pitch,
      energy,
      spectralFeatures,
      tempo
    };
  } catch (error) {
    tf.dispose(audioTensor);
    throw error;
  }
};

const extractPitch = async (
  audioData: Float32Array,
  sampleRate: number,
  frameSize: number,
  hopSize: number
): Promise<number[]> => {
  const pitches: number[] = [];
  
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    const frame = audioData.slice(i, i + frameSize);
    const acf = new Float32Array(frameSize);
    
    // Compute autocorrelation
    for (let lag = 0; lag < frameSize; lag++) {
      let sum = 0;
      for (let n = 0; n < frameSize - lag; n++) {
        sum += frame[n] * frame[n + lag];
      }
      acf[lag] = sum;
    }
    
    // Find pitch
    let maxCorr = -Infinity;
    let pitch = 0;
    for (let lag = 30; lag < frameSize / 2; lag++) {
      if (acf[lag] > maxCorr) {
        maxCorr = acf[lag];
        pitch = sampleRate / lag;
      }
    }
    
    pitches.push(pitch);
  }
  
  return pitches;
};

const calculateEnergy = async (
  audioData: Float32Array,
  frameSize: number,
  hopSize: number
): Promise<number[]> => {
  const energies: number[] = [];
  
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    const frame = audioData.slice(i, i + frameSize);
    const energy = frame.reduce((sum, val) => sum + val * val, 0) / frameSize;
    energies.push(energy);
  }
  
  return energies;
};

const extractSpectralFeatures = async (spectrogram: number[][]): Promise<Float32Array> => {
  const numMelBands = 40;
  const spectralFeatures = new Float32Array(numMelBands);
  
  const numFrames = spectrogram.length;
  for (let i = 0; i < numMelBands; i++) {
    let sum = 0;
    for (let j = 0; j < numFrames; j++) {
      const binIndex = Math.floor((i / numMelBands) * (spectrogram[j].length));
      sum += spectrogram[j][binIndex];
    }
    spectralFeatures[i] = sum / numFrames;
  }
  
  return spectralFeatures;
};

const calculateTempo = (energies: number[], sampleRate: number, hopSize: number): number => {
  // Simple tempo estimation using energy peaks
  const frameTime = hopSize / sampleRate;
  let peaks = 0;
  
  for (let i = 1; i < energies.length - 1; i++) {
    if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1]) {
      peaks++;
    }
  }
  
  const duration = energies.length * frameTime;
  return (peaks / duration) * 60; // Convert to BPM
};