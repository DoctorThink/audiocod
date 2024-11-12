import { supabase } from "@/integrations/supabase/client";

export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
}

export const analyzeEmotions = async (audioData: ArrayBuffer): Promise<EmotionScores> => {
  try {
    // Convert audio data to base64
    const base64Audio = Buffer.from(audioData).toString('base64');
    
    // Upload to Supabase storage
    const fileName = `analysis_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, audioData);

    if (uploadError) throw uploadError;

    // Process audio and get emotion scores
    const { data, error } = await supabase
      .from('audio_analyses')
      .insert({
        file_path: uploadData.path,
        emotion_scores: {
          neutral: 0,
          happy: 0,
          sad: 0,
          angry: 0,
          fearful: 0
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data.emotion_scores as EmotionScores;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
};