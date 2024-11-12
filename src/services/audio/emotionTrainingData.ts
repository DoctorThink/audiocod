// Training data for emotion classification
export const emotionTrainingData = {
  features: [
    // Happy samples
    [1.2, 0.8, 1.1, 0.9, 1.0], // High pitch, high energy
    [1.1, 0.9, 1.0, 0.8, 0.9],
    [1.3, 0.7, 1.2, 1.0, 1.1],
    
    // Sad samples
    [0.7, 0.4, 0.6, 0.5, 0.4], // Low pitch, low energy
    [0.6, 0.5, 0.5, 0.4, 0.5],
    [0.8, 0.3, 0.7, 0.6, 0.3],
    
    // Angry samples
    [1.4, 1.3, 0.9, 1.2, 1.5], // High energy, sharp variations
    [1.3, 1.4, 1.0, 1.1, 1.4],
    [1.5, 1.2, 0.8, 1.3, 1.6],
    
    // Fearful samples
    [0.9, 0.7, 0.4, 0.8, 0.6], // Irregular patterns
    [0.8, 0.8, 0.5, 0.7, 0.5],
    [1.0, 0.6, 0.3, 0.9, 0.7],
    
    // Neutral samples
    [1.0, 1.0, 1.0, 1.0, 1.0], // Balanced features
    [0.9, 1.1, 0.9, 1.1, 1.0],
    [1.1, 0.9, 1.1, 0.9, 1.0]
  ],
  labels: [
    [1, 0, 0, 0, 0], // Happy
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    
    [0, 1, 0, 0, 0], // Sad
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    
    [0, 0, 1, 0, 0], // Angry
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    
    [0, 0, 0, 1, 0], // Fearful
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    
    [0, 0, 0, 0, 1], // Neutral
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1]
  ]
};