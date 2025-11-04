import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { AdminMatchDetail } from './types';

export const getMatchWithDetails = cache(async (matchId: string): Promise<AdminMatchDetail | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      id,
      division_id,
      match_date,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      notes,
      home_team:home_team_id (
        id,
        name,
        short_name
      ),
      away_team:away_team_id (
        id,
        name,
        short_name
      ),
      goals (
        id,
        team_id,
        player_id,
        minute,
        is_own_goal
      )
    `
    )
    .eq('id', matchId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch match: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const normalizeTeam = (team: any) => {
    if (!team) return null;
    return Array.isArray(team) ? team[0] ?? null : team;
  };

  return {
    id: data.id,
    division_id: data.division_id,
    match_date: data.match_date,
    home_team_id: data.home_team_id,
    away_team_id: data.away_team_id,
    home_score: data.home_score,
    away_score: data.away_score,
    notes: data.notes,
    goals: (data.goals ?? []).map((goal: any) => ({
      id: goal.id,
      team_id: goal.team_id,
      player_id: goal.player_id,
      minute: goal.minute,
      is_own_goal: goal.is_own_goal,
    })),
    home_team: normalizeTeam(data.home_team),
    away_team: normalizeTeam(data.away_team),
  } as AdminMatchDetail;
});

export const getMatchesForDivision = cache(
  async (divisionId: string, limit = 20): Promise<AdminMatchDetail[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        id,
        division_id,
        match_date,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        notes,
        home_team:home_team_id (
          id,
          name,
          short_name
        ),
        away_team:away_team_id (
          id,
          name,
          short_name
        )
      `
      )
      .eq('division_id', divisionId)
      .order('match_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    const normalizeTeam = (team: any) => {
      if (!team) return null;
      return Array.isArray(team) ? team[0] ?? null : team;
    };

    return (data ?? []).map((match) =>
      ({
        id: match.id,
        division_id: match.division_id,
        match_date: match.match_date,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        home_score: match.home_score,
        away_score: match.away_score,
        notes: match.notes,
        goals: [],
        home_team: normalizeTeam(match.home_team),
        away_team: normalizeTeam(match.away_team),
      }) as AdminMatchDetail
    );
  }
);
