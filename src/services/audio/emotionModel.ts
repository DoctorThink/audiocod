import * as tf from '@tensorflow/tfjs';

// Define the model architecture
export const createEmotionModel = () => {
  const model = tf.sequential();
  
  // Input layer for our audio features
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    inputShape: [40] // 40 features from our mel spectrogram
  }));
  
  model.add(tf.layers.dropout({ rate: 0.3 }));
  
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  // Output layer with 5 units for our emotions
  model.add(tf.layers.dense({
    units: 5,
    activation: 'softmax'
  }));
  
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
};

// Training data examples (these would typically come from a larger dataset)
export const trainingData = {
  features: [
    // Happy examples
    [/* high energy, rising pitch */],
    // Sad examples
    [/* low energy, falling pitch */],
    // Angry examples
    [/* high energy, sharp variations */],
    // Fearful examples
    [/* irregular patterns, trembling */],
    // Neutral examples
    [/* steady patterns, moderate energy */]
  ],
  labels: [
    [1, 0, 0, 0, 0], // Happy
    [0, 1, 0, 0, 0], // Sad
    [0, 0, 1, 0, 0], // Angry
    [0, 0, 0, 1, 0], // Fearful
    [0, 0, 0, 0, 1]  // Neutral
  ]
};

// Function to train the model
export const trainModel = async (model: tf.Sequential, features: number[][], labels: number[][]) => {
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);
  
  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
      }
    }
  });
  
  xs.dispose();
  ys.dispose();
};

// Function to predict emotions from features
export const predictEmotion = async (model: tf.Sequential, features: number[]) => {
  const input = tf.tensor2d([features]);
  const prediction = model.predict(input) as tf.Tensor;
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
};