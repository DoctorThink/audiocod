import * as tf from '@tensorflow/tfjs';
import { createEmotionModel, trainModel, predictEmotion, trainingData } from './emotionModel';

let emotionModel: tf.Sequential | null = null;

const initializeModel = async () => {
  if (!emotionModel) {
    emotionModel = createEmotionModel();
    await trainModel(emotionModel, trainingData.features, trainingData.labels);
  }
  return emotionModel;
};

export const calculateEmotions = async (
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>,
  spectralFeatures: Float32Array
) => {
  // Initialize and ensure model is trained
  const model = await initializeModel();
  
  // Extract relevant features from the audio data
  const features = extractFeatures(timeSeriesData, spectralFeatures);
  
  // Get emotion predictions
  const emotions = await predictEmotion(model, features);
  
  return emotions;
};

const extractFeatures = (
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>,
  spectralFeatures: Float32Array
): number[] => {
  // Calculate statistical features from time series data
  const pitches = timeSeriesData.map(d => d.pitch);
  const energies = timeSeriesData.map(d => d.energy);
  
  const features = [
    // Pitch features
    mean(pitches),
    std(pitches),
    Math.max(...pitches),
    Math.min(...pitches),
    
    // Energy features
    mean(energies),
    std(energies),
    Math.max(...energies),
    Math.min(...energies),
    
    // Rate of change features
    calculateRateOfChange(pitches),
    calculateRateOfChange(energies),
    
    // Spectral features (first 30 coefficients)
    ...Array.from(spectralFeatures.slice(0, 30))
  ];
  
  return features;
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

function calculateRateOfChange(arr: number[]): number {
  let changes = 0;
  for (let i = 1; i < arr.length; i++) {
    changes += Math.abs(arr[i] - arr[i - 1]);
  }
  return changes / (arr.length - 1);
}