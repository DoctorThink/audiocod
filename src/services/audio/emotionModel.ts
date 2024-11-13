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
    
    // Enhanced model architecture
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [43], // Updated input shape for enhanced features
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Deep architecture for better feature extraction
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    model.add(tf.layers.batchNormalization());
    
    // Output layer with softmax for emotion probabilities
    model.add(tf.layers.dense({
      units: 5,
      activation: 'softmax'
    }));
    
    // Advanced optimizer configuration
    const optimizer = tf.train.adam(0.001, 0.9, 0.999, 1e-7);
    
    model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.model = model;
    await this.loadPretrainedWeights();
  }
  
  private async loadPretrainedWeights() {
    // Initialize with normalized random weights for testing
    // In production, you would load pre-trained weights here
    if (!this.model) return;
    
    const prediction = this.model.predict(tf.zeros([1, 43])) as tf.Tensor;
    prediction.dispose();
  }
  
  async predict(features: AudioFeatures): Promise<EmotionPrediction> {
    if (!this.model) await this.initialize();
    
    // Feature engineering and normalization
    const processedFeatures = this.preprocessFeatures(features);
    
    const inputFeatures = tf.tensor2d([processedFeatures]);
    const prediction = this.model!.predict(inputFeatures) as tf.Tensor;
    const probabilities = await prediction.array() as number[][];
    
    // Cleanup tensors
    inputFeatures.dispose();
    prediction.dispose();
    
    return {
      neutral: probabilities[0][0],
      happy: probabilities[0][1],
      sad: probabilities[0][2],
      angry: probabilities[0][3],
      fearful: probabilities[0][4]
    };
  }
  
  private preprocessFeatures(features: AudioFeatures): number[] {
    const meanPitch = features.pitch.reduce((a, b) => a + b, 0) / features.pitch.length;
    const meanEnergy = features.energy.reduce((a, b) => a + b, 0) / features.energy.length;
    const pitchVariance = this.calculateVariance(features.pitch, meanPitch);
    const energyVariance = this.calculateVariance(features.energy, meanEnergy);
    
    // Advanced feature engineering
    const zeroCrossingRate = features.zeroCrossings ? 
      features.zeroCrossings.reduce((a, b) => a + b, 0) / features.zeroCrossings.length : 0;
    
    return [
      meanPitch,
      meanEnergy,
      pitchVariance,
      energyVariance,
      zeroCrossingRate,
      features.tempo,
      ...Array.from(features.spectralFeatures)
    ];
  }
  
  private calculateVariance(values: number[], mean: number): number {
    return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  }
}

export const emotionModel = new EmotionModel();