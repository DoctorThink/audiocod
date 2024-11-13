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
    
    // Input layer for processed audio features
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [43] // 40 mel bands + pitch + energy + tempo
    }));
    
    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Output layer for 5 emotions
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
    // In a real implementation, we would load pre-trained weights here
    // For now, we'll use random weights for demonstration
    await this.model!.predict(tf.zeros([1, 43])).dispose();
  }
  
  async predict(features: AudioFeatures): Promise<EmotionPrediction> {
    if (!this.model) await this.initialize();
    
    // Prepare input features
    const meanPitch = features.pitch.reduce((a, b) => a + b, 0) / features.pitch.length;
    const meanEnergy = features.energy.reduce((a, b) => a + b, 0) / features.energy.length;
    
    // Combine all features
    const inputFeatures = tf.tensor2d([[
      meanPitch,
      meanEnergy,
      features.tempo,
      ...Array.from(features.spectralFeatures)
    ]]);
    
    // Make prediction
    const prediction = this.model!.predict(inputFeatures) as tf.Tensor;
    const probabilities = await prediction.array();
    
    // Cleanup
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
}

export const emotionModel = new EmotionModel();