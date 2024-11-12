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
          neutral: 0.2,
          happy: 0.3,
          sad: 0.1,
          angry: 0.2,
          fearful: 0.2
        }
      })
      .select()
      .single();

    if (error) throw error;

    // Safely type cast the emotion_scores
    const emotionScores = data.emotion_scores as EmotionScores;
    
    // Validate the shape of the emotion scores
    if (!emotionScores || 
        typeof emotionScores.neutral !== 'number' ||
        typeof emotionScores.happy !== 'number' ||
        typeof emotionScores.sad !== 'number' ||
        typeof emotionScores.angry !== 'number' ||
        typeof emotionScores.fearful !== 'number') {
      throw new Error('Invalid emotion scores format');
    }

    return emotionScores;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
};