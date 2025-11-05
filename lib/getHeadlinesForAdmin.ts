import { createSupabaseServerClient } from './supabaseClient';
import type { HeadlineWithDetails } from './types';

export async function getHeadlinesForAdmin(divisionId?: string, limit = 50, offset = 0): Promise<HeadlineWithDetails[]> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from('headlines')
    .select(`
      *,
      matches (
        id,
        home_team:teams!home_team_id(name, short_name),
        away_team:teams!away_team_id(name, short_name),
        match_date
      ),
      divisions (name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (divisionId) {
    query = query.eq('division_id', divisionId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch headlines: ${error.message}`);
  }

  return data || [];
}

export async function getHeadlineById(headlineId: string): Promise<HeadlineWithDetails> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('headlines')
    .select(`
      *,
      matches (
        id,
        home_team:teams!home_team_id(name, short_name),
        away_team:teams!away_team_id(name, short_name),
        match_date
      ),
      divisions (name)
    `)
    .eq('id', headlineId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch headline: ${error.message}`);
  }

  return data;
}