import { supabase } from "@/integrations/supabase/client";
import Meyda from "meyda";

export interface AnalysisResult {
  speakerProfile: {
    id: string;
    confidence: number;
    characteristics: {
      pitchMean: number;
      pitchRange: [number, number];
      voiceQuality: number;
      clarity: number;
      stability: number;
    };
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

function calculateEmotions(timeSeriesData: Array<{ pitch: number; energy: number }>) {
  // Calculate statistical measures
  const pitches = timeSeriesData.map(d => d.pitch);
  const energies = timeSeriesData.map(d => d.energy);
  
  const pitchMean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const energyMean = energies.reduce((a, b) => a + b, 0) / energies.length;
  
  const pitchVariance = pitches.reduce((a, b) => a + Math.pow(b - pitchMean, 2), 0) / pitches.length;
  const energyVariance = energies.reduce((a, b) => a + Math.pow(b - energyMean, 2), 0) / energies.length;
  
  // Calculate emotion scores based on acoustic features
  const happy = Math.min(
    1,
    (energyMean * 0.6 + (1 - pitchVariance) * 0.4) * 
    (pitchMean > pitches[0] ? 1.2 : 0.8)  // Rising pitch indicates positive emotion
  );
  
  const angry = Math.min(
    1,
    (energyVariance * 0.7 + energyMean * 0.3) * 
    (pitchVariance > 0.3 ? 1.3 : 0.7)  // High pitch variance indicates intensity
  );
  
  const sad = Math.min(
    1,
    ((1 - energyMean) * 0.5 + (1 - pitchMean / Math.max(...pitches)) * 0.5) *
    (pitchMean < pitches[0] ? 1.2 : 0.8)  // Falling pitch indicates negative emotion
  );
  
  const fearful = Math.min(
    1,
    (pitchVariance * 0.6 + (1 - energyMean) * 0.4) *
    (energyVariance > 0.3 ? 1.2 : 0.8)  // High energy variance indicates uncertainty
  );
  
  // Calculate neutral as inverse of other emotions
  const emotionSum = happy + angry + sad + fearful;
  const neutral = Math.max(0, 1 - emotionSum / 4);
  
  // Normalize to ensure sum equals 1
  const total = neutral + happy + sad + angry + fearful;
  
  return {
    neutral: neutral / total,
    happy: happy / total,
    sad: sad / total,
    angry: angry / total,
    fearful: fearful / total
  };
}

function calculateVoiceCharacteristics(timeSeriesData: Array<{ pitch: number; energy: number }>) {
  const pitches = timeSeriesData.map(d => d.pitch);
  const energies = timeSeriesData.map(d => d.energy);
  
  // Calculate pitch statistics
  const pitchMean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const pitchMin = Math.min(...pitches);
  const pitchMax = Math.max(...pitches);
  
  // Calculate energy statistics
  const energyMean = energies.reduce((a, b) => a + b, 0) / energies.length;
  const energyVariance = energies.reduce((a, b) => a + Math.pow(b - energyMean, 2), 0) / energies.length;
  
  // Calculate pitch stability (inverse of variance)
  const pitchVariance = pitches.reduce((a, b) => a + Math.pow(b - pitchMean, 2), 0) / pitches.length;
  const stability = 1 / (1 + pitchVariance);
  
  // Calculate voice clarity based on energy consistency
  const clarity = 1 / (1 + energyVariance);
  
  // Calculate overall voice quality
  const voiceQuality = (
    clarity * 0.4 +
    stability * 0.3 +
    energyMean * 0.3
  );
  
  return {
    pitchMean,
    pitchRange: [pitchMin, pitchMax] as [number, number],
    voiceQuality,
    clarity,
    stability
  };
}

async function processAudioFeatures(audioBuffer: AudioBuffer): Promise<{
  pitchMean: number;
  pitchRange: [number, number];
  energy: number;
  timeSeriesData: Array<{ time: number; pitch: number; energy: number }>;
}> {
  return new Promise((resolve) => {
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    const features: Array<{
      spectralCentroid: number;
      rms: number;
    }> = [];

    const analyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source,
      bufferSize: 512,
      featureExtractors: ["rms", "spectralCentroid"],
      callback: (frame) => {
        features.push(frame);
      }
    });

    analyzer.start();
    source.start(0);

    // Process for 2 seconds then resolve
    setTimeout(() => {
      source.stop();
      analyzer.stop();
      audioContext.close();

      const pitches = features.map(f => f.spectralCentroid);
      const energies = features.map(f => f.rms);
      
      resolve({
        pitchMean: pitches.reduce((a, b) => a + b, 0) / pitches.length,
        pitchRange: [Math.min(...pitches), Math.max(...pitches)],
        energy: energies.reduce((a, b) => a + b, 0) / energies.length,
        timeSeriesData: features.map((f, i) => ({
          time: i * (512 / 44100), // Convert frames to seconds
          pitch: f.spectralCentroid,
          energy: f.rms
        }))
      });
    }, 2000);
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
    
    const { timeSeriesData } = await processAudioFeatures(audioBuffer);
    
    // Calculate emotions and voice characteristics based on time series data
    const emotions = calculateEmotions(timeSeriesData);
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
      transcription: "Transcription feature coming soon"
    };
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error;
  }
};