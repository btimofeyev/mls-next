import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { Headline } from './types';

export const getHeadlinesForDivision = cache(
  async (divisionId: string, limit = 3): Promise<Headline[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('headlines')
      .select('*')
      .eq('division_id', divisionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch headlines: ${error.message}`);
    }

    return data ?? [];
  }
);
