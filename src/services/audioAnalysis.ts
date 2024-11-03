import { supabase } from "@/integrations/supabase/client";

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

export const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  // Check file size (10MB limit)
  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Convert audio to MP3 if needed
    let processedBlob = audioBlob;
    if (audioBlob.type !== 'audio/mpeg') {
      // In a real app, you'd convert the audio here
      // For now, we'll just check if it's MP3
      throw new Error('Only MP3 files are supported');
    }

    // Upload to Supabase Storage
    const filename = `${crypto.randomUUID()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filename, processedBlob, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filename);

    // Call the analyze-audio edge function
    const { data, error } = await supabase.functions
      .invoke('analyze-audio', {
        body: { audioUrl: publicUrl }
      });

    if (error) throw error;
    return data as AnalysisResult;
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error;
  }
};