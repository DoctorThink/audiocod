import * as tf from '@tensorflow/tfjs';
import { emotionTrainingData } from './emotionTrainingData';

export interface EmotionPrediction {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
}

class EmotionClassifier {
  private model: tf.LayersModel | null = null;
  
  async initialize() {
    if (this.model) return;
    
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      inputShape: [5] // 5 features: pitch, energy, tempo, clarity, stability
    }));
    
    // Hidden layer
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));
    
    // Output layer (5 emotions)
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
    await this.train();
  }
  
  private async train() {
    if (!this.model) throw new Error('Model not initialized');
    
    const xs = tf.tensor2d(emotionTrainingData.features);
    const ys = tf.tensor2d(emotionTrainingData.labels);
    
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 4,
      shuffle: true
    });
    
    xs.dispose();
    ys.dispose();
  }
  
  async predict(features: number[]): Promise<EmotionPrediction> {
    if (!this.model) await this.initialize();
    
    const input = tf.tensor2d([features]);
    const prediction = this.model!.predict(input) as tf.Tensor;
    const probabilities = await prediction.array();
    
    input.dispose();
    prediction.dispose();
    
    return {
      neutral: probabilities[0][4],
      happy: probabilities[0][0],
      sad: probabilities[0][1],
      angry: probabilities[0][2],
      fearful: probabilities[0][3]
    };
  }
}

export const emotionClassifier = new EmotionClassifier();