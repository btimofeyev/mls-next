import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { Goal, Match, Player, ScorerRow, Team } from './types';
import { formatPlayerDisplayName } from './utils';

export const getTopScorers = cache(async (divisionId: string): Promise<ScorerRow[]> => {
  const supabase = createSupabaseServerClient();

  const [
    { data: teams, error: teamsError },
    { data: matches, error: matchesError },
  ] = await Promise.all([
    supabase.from('teams').select('id, short_name').eq('division_id', divisionId),
    supabase.from('matches').select('id').eq('division_id', divisionId),
  ]);

  if (teamsError) {
    throw new Error(`Failed to load teams: ${teamsError.message}`);
  }

  if (matchesError) {
    throw new Error(`Failed to load matches: ${matchesError.message}`);
  }

  if (!teams || teams.length === 0) {
    return [];
  }

  const teamIdSet = new Set(teams.map((team: Pick<Team, 'id'>) => team.id));
  const matchIds = (matches ?? []).map((match: Pick<Match, 'id'>) => match.id);

  if (matchIds.length === 0) {
    return [];
  }

  const [{ data: goals, error: goalsError }, { data: players, error: playersError }] = await Promise.all([
    supabase
      .from('goals')
      .select('match_id, player_id, team_id, is_own_goal')
      .in('match_id', matchIds)
      .eq('is_own_goal', false),
    supabase
      .from('players')
      .select('id, name, team_id')
      .in(
        'team_id',
        Array.from(teamIdSet)
      ),
  ]);

  if (goalsError) {
    throw new Error(`Failed to load goals: ${goalsError.message}`);
  }

  if (playersError) {
    throw new Error(`Failed to load players: ${playersError.message}`);
  }

  const playersById = new Map<string, Pick<Player, 'id' | 'name' | 'team_id'>>();
  (players ?? []).forEach((player) => {
    playersById.set(player.id, player);
  });

  const teamsById = new Map<string, Pick<Team, 'id' | 'short_name'>>();
  teams.forEach((team) => {
    teamsById.set(team.id, team);
  });

  const scorerMap = new Map<
    string,
    {
      playerId: string;
      goals: number;
      matchIds: Set<string>;
    }
  >();

  (goals ?? []).forEach((goal: Pick<Goal, 'match_id' | 'player_id'> & { team_id: string }) => {
    if (!goal.player_id) {
      return;
    }

    const player = playersById.get(goal.player_id);
    if (!player) {
      return;
    }

    if (!teamIdSet.has(player.team_id)) {
      return;
    }

    const existing = scorerMap.get(goal.player_id);
    if (existing) {
      existing.goals += 1;
      existing.matchIds.add(goal.match_id);
    } else {
      scorerMap.set(goal.player_id, {
        playerId: goal.player_id,
        goals: 1,
        matchIds: new Set([goal.match_id]),
      });
    }
  });

  const scorerRows: ScorerRow[] = Array.from(scorerMap.values()).map((entry) => {
    const player = playersById.get(entry.playerId)!;
    const team = teamsById.get(player.team_id);

    return {
      playerId: entry.playerId,
      playerName: formatPlayerDisplayName(player.name),
      teamId: player.team_id,
      teamShortName: team?.short_name ?? 'Unknown',
      goals: entry.goals,
      matchesWithGoal: entry.matchIds.size,
    };
  });

  scorerRows.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.playerName.localeCompare(b.playerName);
  });

  scorerRows.forEach((row, index) => {
    row.rank = index + 1;
  });

  return scorerRows;
});
