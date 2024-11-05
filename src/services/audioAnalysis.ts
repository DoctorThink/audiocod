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
  await tf.ready();
  
  return new Promise(async (resolve) => {
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const frameSize = 2048;
    const hopSize = 512;
    const fft = new Float32Array(frameSize);
    const spectralFeatures = new Float32Array(40); // Number of mel bands
    
    // Convert audio data to tensor
    const audioTensor = tf.tensor1d(audioData);
    
    try {
      // Apply windowing
      const hammingWindow = tf.signal.hammingWindow(frameSize);
      const frames = tf.signal.frame(audioTensor, frameSize, hopSize);
      const windowedFrames = tf.mul(frames, hammingWindow);
      
      // Compute magnitude spectrum
      const spectrogramTensor = tf.abs(tf.spectral.rfft(windowedFrames));
      const spectrogram = await spectrogramTensor.array();
      
      // Calculate average spectral features
      const numFrames = spectrogram.length;
      for (let i = 0; i < 40; i++) {
        let sum = 0;
        for (let j = 0; j < numFrames; j++) {
          const binIndex = Math.floor((i / 40) * (frameSize / 2));
          sum += spectrogram[j][binIndex];
        }
        spectralFeatures[i] = sum / numFrames;
      }
      
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

      // Cleanup tensors
      tf.dispose([audioTensor, hammingWindow, frames, windowedFrames, spectrogramTensor]);

      resolve({
        timeSeriesData,
        spectralFeatures
      });
    } catch (error) {
      // Cleanup on error
      tf.dispose(audioTensor);
      throw error;
    }
  });
}

export const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
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
        energy_level: timeSeriesData.reduce((acc, curr) => acc + curr.energy, 0) / timeSeriesData.length,
        spectral_features: Array.from(spectralFeatures),
        emotion_scores: emotions
      });

    if (dbError) throw dbError;

    return {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: characteristics.stability,
        characteristics
      },
      emotions,
      timeSeriesData
    };
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error;
  }
};