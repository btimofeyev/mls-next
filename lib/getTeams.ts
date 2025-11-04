import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { Team } from './types';

export const getTeamsByDivision = cache(async (divisionId: string): Promise<Team[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('division_id', divisionId)
    .order('short_name');

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }

  return data ?? [];
});

export const getTeamById = cache(async (teamId: string): Promise<Team | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch team: ${error.message}`);
  }

  return data ?? null;
});
