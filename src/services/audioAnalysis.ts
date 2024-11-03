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
    
    const { pitchMean, pitchRange, energy, timeSeriesData } = await processAudioFeatures(audioBuffer);

    const emotions = {
      neutral: 0.2,
      happy: energy > 0.6 ? 0.4 : 0.1,
      sad: energy < 0.3 ? 0.4 : 0.1,
      angry: energy > 0.8 ? 0.4 : 0.1,
      fearful: energy < 0.2 ? 0.4 : 0.1
    };

    const { error: dbError } = await supabase
      .from('audio_analyses')
      .insert({
        file_path: filename,
        pitch_mean: pitchMean,
        pitch_range: pitchRange,
        energy_level: energy
      });

    if (dbError) throw dbError;

    return {
      speakerProfile: {
        id: crypto.randomUUID(),
        confidence: 0.85,
        characteristics: {
          pitchMean,
          pitchRange,
          voiceQuality: energy
        }
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