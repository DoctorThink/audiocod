import { type EmotionType, type EmotionalState } from '@/types/emotionAnalysis';

interface FeatureWeights {
  [key: string]: number[];
}

interface EmotionBaselines {
  [key: string]: number[];
}

interface VoiceMetrics {
  voiceQuality: number;
  clarity: number;
  stability: number;
  pitch: number;
  energy: number;
}

export class AdvancedEmotionAnalyzer {
  private featureWeights: FeatureWeights;
  private emotionBaselines: EmotionBaselines;
  private thresholds: Record<string, number>;

  constructor() {
    this.featureWeights = {
      voiceQuality: [0.35, 0.15, 0.20, 0.15, 0.15],
      clarity: [0.20, 0.25, 0.20, 0.15, 0.20],
      stability: [0.40, 0.15, 0.15, 0.15, 0.15],
      pitch: [0.15, 0.25, 0.25, 0.20, 0.15],
      energy: [0.15, 0.20, 0.20, 0.25, 0.20]
    };

    this.emotionBaselines = {
      neutral: [0.5, 0.7, 0.8, 0.5, 0.5],
      happy: [0.7, 0.8, 0.6, 0.7, 0.7],
      sad: [0.4, 0.9, 0.3, 0.3, 0.2],
      angry: [0.3, 0.7, 0.2, 0.8, 0.9],
      fearful: [0.3, 0.6, 0.2, 0.6, 0.4]
    };

    this.thresholds = {
      activation: 0.3,
      confidenceMinimum: 0.4,
      emotionalOverlap: 0.2
    };
  }

  private normalizeFeatures(metrics: VoiceMetrics): number[] {
    return [
      metrics.voiceQuality / 100,
      metrics.clarity / 100,
      metrics.stability / 100,
      this.normalizePitch(metrics.pitch),
      metrics.energy
    ];
  }

  private normalizePitch(pitch: number): number {
    const minPitch = 50;
    const maxPitch = 1600;
    const logPitch = Math.log1p(pitch - minPitch);
    const logRange = Math.log1p(maxPitch - minPitch);
    return logPitch / logRange;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private calculateEmotionalVectors(normalizedFeatures: number[]): Record<EmotionType, number[]> {
    const emotionalVectors: Partial<Record<EmotionType, number[]>> = {};
    
    Object.entries(this.emotionBaselines).forEach(([emotion, baseline]) => {
      const distance = normalizedFeatures.map((feature, i) => Math.abs(feature - baseline[i]));
      const weightedDistance = distance.map((d, i) => 
        d * this.featureWeights[Object.keys(this.featureWeights)[i]][i]
      );
      
      const emotionVector = weightedDistance.map(d => Math.exp(-d));
      const sum = emotionVector.reduce((a, b) => a + b, 0);
      emotionalVectors[emotion as EmotionType] = emotionVector.map(v => v / sum);
    });

    return emotionalVectors as Record<EmotionType, number[]>;
  }

  private calculateConfidence(
    emotionalVectors: Record<EmotionType, number[]>,
    normalizedFeatures: number[]
  ): number {
    const featureConfidence = normalizedFeatures.reduce((a, b) => a + b, 0) / normalizedFeatures.length;
    
    const emotionScores = Object.values(emotionalVectors)
      .map(vector => vector.reduce((a, b) => a + b, 0));
    const sortedScores = [...emotionScores].sort((a, b) => b - a);
    const distinctionConfidence = (sortedScores[0] - sortedScores[1]) / sortedScores[0];
    
    const alignmentScores = Object.entries(emotionalVectors)
      .map(([emotion, vector]) => {
        const baseline = this.emotionBaselines[emotion];
        return vector.reduce((sum, v, i) => sum + v * baseline[i], 0);
      });
    const vectorConfidence = alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length;
    
    return (
      featureConfidence * 0.3 +
      distinctionConfidence * 0.4 +
      vectorConfidence * 0.3
    ) * 100;
  }

  public analyze(metrics: VoiceMetrics): EmotionalState {
    const normalizedFeatures = this.normalizeFeatures(metrics);
    const emotionalVectors = this.calculateEmotionalVectors(normalizedFeatures);
    
    // Calculate emotion scores
    const emotionScores = Object.entries(emotionalVectors).reduce((scores, [emotion, vector]) => {
      const score = vector.reduce((sum, v, i) => 
        sum + v * this.featureWeights[Object.keys(this.featureWeights)[i]][i], 0
      );
      scores[emotion as EmotionType] = score * 100;
      return scores;
    }, {} as Record<EmotionType, number>);
    
    const confidence = this.calculateConfidence(emotionalVectors, normalizedFeatures);
    
    // Determine primary and secondary emotions
    const sortedEmotions = Object.entries(emotionScores)
      .sort(([, a], [, b]) => b - a);
    
    return {
      primary: sortedEmotions[0][0] as EmotionType,
      secondary: sortedEmotions[1][1] >= this.thresholds.confidenceMinimum ? 
        sortedEmotions[1][0] as EmotionType : undefined,
      confidence: emotionScores,
      timestamp: Date.now()
    };
  }
}