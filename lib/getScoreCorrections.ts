import { createSupabaseServerClient } from './supabaseClient';
import type { ScoreCorrection, ScoreCorrectionStatus } from './types';

export async function getScoreCorrections(limit = 200): Promise<ScoreCorrection[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('score_corrections')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load score corrections: ${error.message}`);
  }

  return data ?? [];
}

export async function updateScoreCorrection(
  correctionId: string,
  updates: { status?: ScoreCorrectionStatus; notes?: string | null }
) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('score_corrections')
    .update(updates)
    .eq('id', correctionId)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update score correction: ${error.message}`);
  }

  return data as ScoreCorrection | null;
}
