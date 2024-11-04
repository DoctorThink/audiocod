import { supabase } from "@/integrations/supabase/client";
import * as tf from '@tensorflow/tfjs';
import { calculateEmotions } from "./audio/emotionAnalysis";
import { calculateVoiceCharacteristics, type VoiceCharacteristics } from "./audio/voiceCharacteristics";

export interface AnalysisResult {
  speakerProfile: {
    id: string;
    confidence: number;
    characteristics: VoiceCharacteristics;
  };
  emotions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
  };
  timeSeriesData: Array<{
    time: number;
    pitch: number;
    energy: number;
  }>;
  transcription?: string;
}

async function processAudioFeatures(audioBuffer: AudioBuffer): Promise<{
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>;
  spectralFeatures: Float32Array;
}> {
  return new Promise(async (resolve) => {
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const frameSize = 2048;
    const hopSize = 512;
    
    // Convert audio data to tensor
    const audioTensor = tf.tensor1d(audioData);
    
    // Apply short-time Fourier transform
    const stft = tf.signal.stft(audioTensor, frameSize, hopSize);
    const magnitudes = tf.abs(stft);
    
    // Calculate mel-spectrogram
    const melSpectrogram = tf.signal.linearToMelSpectrogram(
      magnitudes,
      sampleRate,
      frameSize,
      40, // Number of mel bands
      0,  // Minimum frequency
      sampleRate / 2 // Maximum frequency
    );
    
    // Extract features
    const features = await melSpectrogram.data();
    
    // Process time series data
    const timeSeriesData = Array.from({ length: Math.floor(audioData.length / hopSize) }, (_, i) => {
      const time = i * (hopSize / sampleRate);
      const startIdx = i * hopSize;
      const frame = audioData.slice(startIdx, startIdx + frameSize);
      
      // Calculate pitch using autocorrelation
      const acf = new Float32Array(frameSize);
      for (let lag = 0; lag < frameSize; lag++) {
        let sum = 0;
        for (let n = 0; n < frameSize - lag; n++) {
          sum += frame[n] * frame[n + lag];
        }
        acf[lag] = sum;
      }
      
      // Find pitch
      let maxCorr = -Infinity;
      let pitch = 0;
      for (let lag = 30; lag < frameSize / 2; lag++) {
        if (acf[lag] > maxCorr) {
          maxCorr = acf[lag];
          pitch = sampleRate / lag;
        }
      }
      
      // Calculate energy
      const energy = frame.reduce((sum, val) => sum + val * val, 0) / frameSize;
      
      return { time, pitch, energy };
    });

    resolve({
      timeSeriesData,
      spectralFeatures: new Float32Array(features)
    });
  });
}

export const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Load TensorFlow.js model
    await tf.ready();
    
    const filename = `${crypto.randomUUID()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filename, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const { timeSeriesData, spectralFeatures } = await processAudioFeatures(audioBuffer);
    
    // Use spectral features for emotion detection
    const emotions = calculateEmotions(timeSeriesData, spectralFeatures);
    const characteristics = calculateVoiceCharacteristics(timeSeriesData);

    const { error: dbError } = await supabase
      .from('audio_analyses')
      .insert({
        file_path: filename,
        pitch_mean: characteristics.pitchMean,
        pitch_range: characteristics.pitchRange,
        energy_level: timeSeriesData.reduce((acc, curr) => acc + curr.energy, 0) / timeSeriesData.length
      });

    if (dbError) throw dbError;

    return {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: characteristics.stability,
        characteristics
      },
      emotions,
      timeSeriesData,
      transcription: "Advanced transcription coming soon"
    };
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error;
  }
};