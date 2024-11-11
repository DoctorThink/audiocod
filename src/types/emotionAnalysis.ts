export interface VoiceParameters {
  voiceQuality: number;
  clarity: number;
  stability: number;
  averagePitch: number;
  pitchRange: [number, number];
  energyLevel: number;
  timeSeriesPitch: number[];
  timeSeriesEnergy: number[];
}

export interface EmotionalState {
  primary: EmotionType;
  secondary?: EmotionType;
  confidence: Record<EmotionType, number>;
  timestamp: number;
}

export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful';

export interface EmotionAnalysisConfig {
  baselineQuality: number;
  qualityThreshold: number;
  minConfidence: number;
  updateInterval: number;
  sampleWindow: number;
  baselineDuration: number;
  maxTransitions: number;
}