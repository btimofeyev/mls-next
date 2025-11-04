import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { Division } from './types';

export const getDivisionById = cache(async (divisionId: string): Promise<Division | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('divisions').select('*').eq('id', divisionId).maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch division: ${error.message}`);
  }
  return data ?? null;
});

export const getDivisions = cache(async (): Promise<Division[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('divisions').select('*').order('name');
  if (error) {
    throw new Error(`Failed to fetch divisions: ${error.message}`);
  }
  return data ?? [];
});
