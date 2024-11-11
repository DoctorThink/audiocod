import { VoiceParameters, EmotionalState, EmotionType, EmotionAnalysisConfig } from '@/types/emotionAnalysis';

const DEFAULT_CONFIG: EmotionAnalysisConfig = {
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
  private config: EmotionAnalysisConfig;

  constructor(config: Partial<EmotionAnalysisConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyzeVoiceParameters(params: VoiceParameters): EmotionalState {
    if (!this.baseline) {
      this.baseline = this.initializeBaseline(params);
    }

    const emotionalIndicators = this.calculateEmotionalIndicators(params);
    const emotions = this.determineEmotions(emotionalIndicators);
    
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
    const energyLevel = params.energyLevel;
    
    return {
      isStressed,
      emotionalIntensity,
      emotionalDistress,
      pitchDeviation,
      energyLevel
    };
  }

  private determineEmotions(indicators: any): {
    primary: EmotionType;
    secondary?: EmotionType;
    confidence: Record<EmotionType, number>;
  } {
    const confidence: Record<EmotionType, number> = {
      neutral: this.calculateNeutralConfidence(indicators),
      happy: this.calculateHappyConfidence(indicators),
      sad: this.calculateSadConfidence(indicators),
      angry: this.calculateAngryConfidence(indicators),
      fearful: this.calculateFearfulConfidence(indicators)
    };

    const sortedEmotions = Object.entries(confidence)
      .sort(([, a], [, b]) => b - a);

    const [primary, secondary] = sortedEmotions;

    return {
      primary: primary[0] as EmotionType,
      secondary: secondary[1] >= this.config.minConfidence ? secondary[0] as EmotionType : undefined,
      confidence
    };
  }

  private calculateNeutralConfidence(indicators: any): number {
    return !indicators.isStressed && !indicators.emotionalIntensity ? 0.8 : 0.2;
  }

  private calculateHappyConfidence(indicators: any): number {
    return indicators.energyLevel > 0.8 && !indicators.emotionalDistress ? 0.7 : 0.1;
  }

  private calculateSadConfidence(indicators: any): number {
    return indicators.energyLevel < 0.3 && indicators.emotionalDistress ? 0.7 : 0.1;
  }

  private calculateAngryConfidence(indicators: any): number {
    return indicators.emotionalIntensity && indicators.energyLevel > 0.8 ? 0.8 : 0.1;
  }

  private calculateFearfulConfidence(indicators: any): number {
    return indicators.emotionalDistress && indicators.isStressed ? 0.7 : 0.1;
  }

  private updateHistory(state: EmotionalState): void {
    this.emotionalHistory.push(state);
    // Keep last 4 seconds of history (16 samples at 250ms intervals)
    if (this.emotionalHistory.length > 16) {
      this.emotionalHistory.shift();
    }
  }

  public getEmotionalHistory(): EmotionalState[] {
    return [...this.emotionalHistory];
  }
}
