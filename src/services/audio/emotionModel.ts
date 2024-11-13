import * as tf from '@tensorflow/tfjs';
import type { AudioFeatures } from './emotionFeatureExtractor';

export interface EmotionPrediction {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
}

class EmotionModel {
  private model: tf.LayersModel | null = null;
  
  async initialize() {
    if (this.model) return;
    
    const model = tf.sequential();
    
    // Input layer for enhanced features
    model.add(tf.layers.dense({
      units: 128,
      activation: 'elu',
      inputShape: [43] // Updated for new features
    }));
    
    // Add batch normalization
    model.add(tf.layers.batchNormalization());
    
    // First hidden layer
    model.add(tf.layers.dense({
      units: 64,
      activation: 'elu'
    }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Second hidden layer
    model.add(tf.layers.dense({
      units: 32,
      activation: 'elu'
    }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: 5,
      activation: 'softmax'
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.model = model;
    await this.loadWeights();
  }
  
  private async loadWeights() {
    if (!this.model) return;
    
    // Initialize with zeros for testing
    const prediction = this.model.predict(tf.zeros([1, 43])) as tf.Tensor;
    prediction.dispose();
  }
  
  async predict(features: AudioFeatures): Promise<EmotionPrediction> {
    if (!this.model) await this.initialize();
    
    const meanPitch = features.pitch.reduce((a, b) => a + b, 0) / features.pitch.length;
    const meanEnergy = features.energy.reduce((a, b) => a + b, 0) / features.energy.length;
    const meanZeroCrossings = features.zeroCrossings ? 
      features.zeroCrossings.reduce((a, b) => a + b, 0) / features.zeroCrossings.length : 0;
    
    const inputFeatures = tf.tensor2d([[
      meanPitch,
      meanEnergy,
      features.tempo,
      meanZeroCrossings,
      ...Array.from(features.spectralFeatures)
    ]]);
    
    const prediction = this.model!.predict(inputFeatures) as tf.Tensor;
    const probabilities = await prediction.array() as number[][];
    
    inputFeatures.dispose();
    prediction.dispose();
    
    const result: EmotionPrediction = {
      neutral: probabilities[0][0],
      happy: probabilities[0][1],
      sad: probabilities[0][2],
      angry: probabilities[0][3],
      fearful: probabilities[0][4]
    };
    
    // Apply quality-based calibration
    return this.calibratePredictions(result, features);
  }
  
  private calibratePredictions(
    prediction: EmotionPrediction,
    features: AudioFeatures
  ): EmotionPrediction {
    // Calculate voice quality metrics
    const pitchStability = this.calculatePitchStability(features.pitch);
    const energyClarity = this.calculateEnergyClarity(features.energy);
    const voiceQuality = (pitchStability + energyClarity) / 2;
    
    // Apply quality-based adjustments
    const qualityFactor = Math.max(0.1, voiceQuality);
    const calibrated: EmotionPrediction = {} as EmotionPrediction;
    let total = 0;
    
    for (const [emotion, value] of Object.entries(prediction)) {
      calibrated[emotion as keyof EmotionPrediction] = value * qualityFactor;
      total += value * qualityFactor;
    }
    
    // Normalize to ensure sum is 1
    for (const emotion of Object.keys(calibrated)) {
      calibrated[emotion as keyof EmotionPrediction] /= total;
    }
    
    return calibrated;
  }
  
  private calculatePitchStability(pitch: number[]): number {
    const mean = pitch.reduce((a, b) => a + b, 0) / pitch.length;
    const variance = pitch.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pitch.length;
    return 1 / (1 + variance);
  }
  
  private calculateEnergyClarity(energy: number[]): number {
    const mean = energy.reduce((a, b) => a + b, 0) / energy.length;
    const variance = energy.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / energy.length;
    return 1 / (1 + variance);
  }
}

export const emotionModel = new EmotionModel();