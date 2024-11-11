import { VoiceParameters, EmotionalState, EmotionType } from '@/types/emotionAnalysis';

const DEFAULT_CONFIG = {
  baselineQuality: 0.7,
  qualityThreshold: 0.2,
  minConfidence: 0.4,
  updateInterval: 250,
  sampleWindow: 500,
  baselineDuration: 5000,
  maxTransitions: 3
};

export class EmotionAnalysisService {
  private baseline: VoiceParameters | null = null;
  private lastUpdate: number = 0;
  private emotionalHistory: EmotionalState[] = [];
  private config: typeof DEFAULT_CONFIG;

  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyzeVoiceParameters(params: VoiceParameters): EmotionalState {
    if (!this.baseline) {
      this.baseline = this.initializeBaseline(params);
    }

    const emotionalIndicators = this.calculateEmotionalIndicators(params);
    const emotions = this.normalizeEmotions(this.determineEmotions(emotionalIndicators));
    
    const state: EmotionalState = {
      primary: emotions.primary,
      secondary: emotions.secondary,
      confidence: emotions.confidence,
      timestamp: Date.now()
    };

    this.updateHistory(state);
    return state;
  }

  private initializeBaseline(params: VoiceParameters): VoiceParameters {
    return { ...params };
  }

  private calculateEmotionalIndicators(params: VoiceParameters) {
    const qualityDeviation = Math.abs(params.voiceQuality - this.baseline!.voiceQuality);
    const isStressed = qualityDeviation > this.config.qualityThreshold;
    
    const emotionalIntensity = params.clarity > 0.9 && params.stability < 0.1;
    const emotionalDistress = params.clarity < 0.3 && params.stability < 0.3;
    
    const pitchDeviation = Math.abs(params.averagePitch - this.baseline!.averagePitch);
    const normalizedPitch = this.normalizePitch(params.averagePitch);
    
    return {
      isStressed,
      emotionalIntensity,
      emotionalDistress,
      pitchDeviation,
      normalizedPitch,
      energyLevel: params.energyLevel
    };
  }

  private normalizePitch(pitch: number): number {
    const minPitch = 50;
    const maxPitch = 1600;
    return Math.max(0, Math.min(1, (Math.log(pitch) - Math.log(minPitch)) / (Math.log(maxPitch) - Math.log(minPitch))));
  }

  private determineEmotions(indicators: any): Record<EmotionType, number> {
    const rawScores: Record<EmotionType, number> = {
      neutral: this.calculateNeutralScore(indicators),
      happy: this.calculateHappyScore(indicators),
      sad: this.calculateSadScore(indicators),
      angry: this.calculateAngryScore(indicators),
      fearful: this.calculateFearfulScore(indicators)
    };

    return rawScores;
  }

  private normalizeEmotions(rawScores: Record<EmotionType, number>): {
    primary: EmotionType;
    secondary?: EmotionType;
    confidence: Record<EmotionType, number>;
  } {
    // Get the sum of all scores
    const total = Object.values(rawScores).reduce((sum, score) => sum + score, 0);
    
    // Normalize scores to percentages
    const normalizedScores: Record<EmotionType, number> = {};
    for (const [emotion, score] of Object.entries(rawScores)) {
      normalizedScores[emotion as EmotionType] = (score / total) * 100;
    }

    // Sort emotions by score
    const sortedEmotions = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a);

    return {
      primary: sortedEmotions[0][0] as EmotionType,
      secondary: sortedEmotions[1][1] >= this.config.minConfidence ? sortedEmotions[1][0] as EmotionType : undefined,
      confidence: normalizedScores
    };
  }

  private calculateNeutralScore(indicators: any): number {
    return !indicators.isStressed && !indicators.emotionalIntensity ? 0.8 : 0.2;
  }

  private calculateHappyScore(indicators: any): number {
    const baseScore = indicators.energyLevel > 0.8 && !indicators.emotionalDistress ? 0.7 : 0.1;
    return baseScore * (1 + indicators.normalizedPitch * 0.3);
  }

  private calculateSadScore(indicators: any): number {
    const baseScore = indicators.energyLevel < 0.3 && indicators.emotionalDistress ? 0.7 : 0.1;
    return baseScore * (1 - indicators.normalizedPitch * 0.3);
  }

  private calculateAngryScore(indicators: any): number {
    const baseScore = indicators.emotionalIntensity && indicators.energyLevel > 0.8 ? 0.8 : 0.1;
    return baseScore * (1 + indicators.normalizedPitch * 0.4);
  }

  private calculateFearfulScore(indicators: any): number {
    const baseScore = indicators.emotionalDistress && indicators.isStressed ? 0.7 : 0.1;
    return baseScore * (1 + indicators.pitchDeviation * 0.3);
  }

  private updateHistory(state: EmotionalState): void {
    this.emotionalHistory.push(state);
    if (this.emotionalHistory.length > 16) {
      this.emotionalHistory.shift();
    }
  }

  public getEmotionalHistory(): EmotionalState[] {
    return [...this.emotionalHistory];
  }
}