import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { GoalSummary, LatestResult } from './types';
import { formatPlayerDisplayName } from './utils';

type MatchWithTeams = {
  id: string;
  match_date: string;
  notes: string | null;
  home_score: number;
  away_score: number;
  home_team: {
    id: string;
    name: string;
    short_name: string;
  } | null;
  away_team: {
    id: string;
    name: string;
    short_name: string;
  } | null;
};

type GoalWithPlayer = {
  match_id: string;
  player_id: string | null;
  is_own_goal: boolean;
  player: {
    id: string;
    name: string;
  } | null;
};

export async function fetchLatestResults(divisionId: string, limit = 5): Promise<LatestResult[]> {
  const supabase = createSupabaseServerClient();

  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(
      `
      id,
      match_date,
      notes,
      home_score,
      away_score,
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

  if (matchesError) {
    throw new Error(`Failed to load recent matches: ${matchesError.message}`);
  }

  const matches = ((matchesData ?? []) as unknown) as MatchWithTeams[];

  if (matches.length === 0) {
    return [];
  }

  const matchIds = matches.map((match) => match.id);

  const { data: goalsData, error: goalsError } = await supabase
    .from('goals')
    .select(
      `
      match_id,
      player_id,
      is_own_goal,
      player:player_id (
        id,
        name
      )
    `
    )
    .in('match_id', matchIds);

  if (goalsError) {
    throw new Error(`Failed to load match goals: ${goalsError.message}`);
  }

  const goalsByMatch = new Map<string, GoalWithPlayer[]>();
  (goalsData ?? []).forEach((goal) => {
    const typedGoal = goal as unknown as GoalWithPlayer;
    const list = goalsByMatch.get(typedGoal.match_id);
    if (list) {
      list.push(typedGoal);
    } else {
      goalsByMatch.set(typedGoal.match_id, [typedGoal]);
    }
  });

  const results: LatestResult[] = matches.map((match) => {
    const matchGoals = goalsByMatch.get(match.id) ?? [];

    const tallies = new Map<string, GoalSummary>();
    matchGoals.forEach((goal) => {
      if (goal.is_own_goal || !goal.player || !goal.player_id) {
        return;
      }

      const existing = tallies.get(goal.player_id);
      if (existing) {
        existing.goals += 1;
      } else {
        tallies.set(goal.player_id, {
          playerId: goal.player_id,
          playerName: formatPlayerDisplayName(goal.player.name),
          goals: 1,
        });
      }
    });

    const notableScorers = Array.from(tallies.values())
      .filter((summary) => summary.goals >= 2)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.playerName.localeCompare(b.playerName);
      });

    const result: LatestResult = {
      matchId: match.id,
      matchDate: match.match_date,
      homeTeam: {
        id: match.home_team?.id ?? '',
        name: match.home_team?.name ?? 'Home',
        shortName: match.home_team?.short_name ?? match.home_team?.name ?? 'Home',
        score: match.home_score,
      },
      awayTeam: {
        id: match.away_team?.id ?? '',
        name: match.away_team?.name ?? 'Away',
        shortName: match.away_team?.short_name ?? match.away_team?.name ?? 'Away',
        score: match.away_score,
      },
      notableScorers,
      notes: match.notes,
    };

    return result;
  });

  return results;
}

export const getLatestResults = cache(fetchLatestResults);
