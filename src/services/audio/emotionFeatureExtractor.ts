import * as tf from '@tensorflow/tfjs';

export interface AudioFeatures {
  pitch: number[];
  energy: number[];
  spectralFeatures: Float32Array;
  tempo: number;
  zeroCrossings: number[];
  mfcc: number[][];
}

export const extractAudioFeatures = async (
  audioData: Float32Array,
  sampleRate: number
): Promise<AudioFeatures> => {
  // Enhanced frame processing
  const frameSize = 2048;
  const hopSize = 512;
  const frames = extractFrames(audioData, frameSize, hopSize);
  
  // Parallel processing of features
  const [
    pitchData,
    energyData,
    spectralData,
    zeroCrossingsData,
    mfccData
  ] = await Promise.all([
    extractPitch(frames, sampleRate),
    calculateEnergy(frames),
    calculateSpectralFeatures(frames),
    calculateZeroCrossings(frames),
    calculateMFCC(frames, sampleRate)
  ]);
  
  const tempo = calculateTempo(energyData, sampleRate, hopSize);
  
  return {
    pitch: pitchData,
    energy: energyData,
    spectralFeatures: spectralData,
    tempo,
    zeroCrossings: zeroCrossingsData,
    mfcc: mfccData
  };
};

const extractFrames = (
  audioData: Float32Array,
  frameSize: number,
  hopSize: number
): Float32Array[] => {
  const frames: Float32Array[] = [];
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    frames.push(audioData.slice(i, i + frameSize));
  }
  return frames;
};

const extractPitch = async (
  frames: Float32Array[],
  sampleRate: number
): Promise<number[]> => {
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
  const minLag = Math.floor(sampleRate / 1600);
  const maxLag = Math.floor(sampleRate / 60);
  
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (acf[lag] > maxCorr) {
      maxCorr = acf[lag];
      pitch = sampleRate / lag;
    }
  }
  return pitch;
};

const calculateEnergy = async (frames: Float32Array[]): Promise<number[]> => {
  return frames.map(frame => {
    return frame.reduce((sum, val) => sum + val * val, 0) / frame.length;
  });
};

const calculateSpectralFeatures = async (frames: Float32Array[]): Promise<Float32Array> => {
  const frameArray = frames.map(frame => Array.from(frame));
  const frameTensor = tf.tensor2d(frameArray);
  const spectrogramTensor = tf.abs(tf.spectral.rfft(frameTensor));
  const spectrogram = await spectrogramTensor.array() as number[][];
  
  // Cleanup tensors
  frameTensor.dispose();
  spectrogramTensor.dispose();
  
  // Calculate mel-scale features
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

const calculateZeroCrossings = async (frames: Float32Array[]): Promise<number[]> => {
  return frames.map(frame => {
    let crossings = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0 && frame[i - 1] < 0) || 
          (frame[i] < 0 && frame[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings;
  });
};

const calculateMFCC = async (
  frames: Float32Array[],
  sampleRate: number
): Promise<number[][]> => {
  const numCoefficients = 13;
  const melFilterbanks = createMelFilterbanks(frames[0].length, sampleRate, 40);
  
  return frames.map(frame => {
    const spectrum = calculatePowerSpectrum(frame);
    const melSpectrum = applyMelFilterbanks(spectrum, melFilterbanks);
    return calculateDCT(melSpectrum).slice(0, numCoefficients);
  });
};

const calculatePowerSpectrum = (frame: Float32Array): number[] => {
  const fft = tf.spectral.rfft(tf.tensor1d(Array.from(frame)));
  const magnitude = tf.abs(fft);
  const power = tf.square(magnitude);
  const result = Array.from(power.dataSync());
  
  // Cleanup tensors
  fft.dispose();
  magnitude.dispose();
  power.dispose();
  
  return result;
};

const createMelFilterbanks = (
  fftSize: number,
  sampleRate: number,
  numFilters: number
): number[][] => {
  const melMin = 0;
  const melMax = 2595 * Math.log10(1 + sampleRate / 2 / 700);
  const melPoints = Array.from({ length: numFilters + 2 }, (_, i) =>
    (melMin + (i * (melMax - melMin)) / (numFilters + 1))
  );
  
  const freqPoints = melPoints.map(mel => 
    700 * (Math.pow(10, mel / 2595) - 1)
  );
  
  const filterbanks: number[][] = [];
  for (let i = 0; i < numFilters; i++) {
    const filter = new Array(fftSize / 2 + 1).fill(0);
    for (let j = 0; j < filter.length; j++) {
      const freq = (j * sampleRate) / fftSize;
      if (freq >= freqPoints[i] && freq <= freqPoints[i + 2]) {
        if (freq <= freqPoints[i + 1]) {
          filter[j] = (freq - freqPoints[i]) / (freqPoints[i + 1] - freqPoints[i]);
        } else {
          filter[j] = (freqPoints[i + 2] - freq) / (freqPoints[i + 2] - freqPoints[i + 1]);
        }
      }
    }
    filterbanks.push(filter);
  }
  
  return filterbanks;
};

const applyMelFilterbanks = (
  spectrum: number[],
  filterbanks: number[][]
): number[] => {
  return filterbanks.map(filterbank =>
    Math.log(
      spectrum.reduce((sum, value, i) => sum + value * filterbank[i], 0) + 1e-10
    )
  );
};

const calculateDCT = (input: number[]): number[] => {
  const N = input.length;
  return Array.from({ length: N }, (_, k) => {
    const sum = input.reduce((acc, x, n) =>
      acc + x * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N))
    , 0);
    return sum * Math.sqrt(2 / N) * (k === 0 ? 1 / Math.sqrt(2) : 1);
  });
};

const calculateTempo = (
  energy: number[],
  sampleRate: number,
  hopSize: number
): number => {
  const peaks = findPeaks(energy);
  const duration = (energy.length * hopSize) / sampleRate;
  return (peaks.length / duration) * 60;
};

const findPeaks = (signal: number[]): number[] => {
  const peaks: number[] = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
      peaks.push(i);
    }
  }
  return peaks;
};