import { supabase } from "@/integrations/supabase/client";
import Meyda from "meyda";
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

    setTimeout(() => {
      source.stop();
      analyzer.stop();
      audioContext.close();

      resolve({
        timeSeriesData: features.map((f, i) => ({
          time: i * (512 / 44100),
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