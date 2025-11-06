import { createSupabaseServerClient } from './supabaseClient';
import { getDivisionById } from './getDivision';
import { getStandings } from './getStandings';
import { getTeamById } from './getTeams';
import type { MatchNoteSummary, TeamPageData, TeamRecentMatch, TeamRecordSummary, TeamScorerRow } from './types';
import { formatPlayerDisplayName } from './utils';

type MatchWithTeams = {
  id: string;
  match_date: string;
  notes: string | null;
  home_team_id: string;
  away_team_id: string;
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

export async function getTeamPageData(teamId: string): Promise<TeamPageData | null> {
  const team = await getTeamById(teamId);
  if (!team) {
    return null;
  }

  const [division, standings] = await Promise.all([
    getDivisionById(team.division_id),
    getStandings(team.division_id),
  ]);

  const recordRow = standings.find((row) => row.teamId === teamId);
  const record: TeamRecordSummary | null = recordRow
    ? {
        teamId,
        w: recordRow.w,
        d: recordRow.d,
        l: recordRow.l,
        gf: recordRow.gf,
        ga: recordRow.ga,
        gd: recordRow.gd,
        points: recordRow.points,
      }
    : null;

  const supabase = createSupabaseServerClient();

  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(
      `
      id,
      match_date,
      notes,
      home_team_id,
      away_team_id,
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
    .eq('division_id', team.division_id)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('match_date', { ascending: false });

  if (matchesError) {
    throw new Error(`Failed to load team matches: ${matchesError.message}`);
  }

  const normalizeTeam = (team: any) => {
    if (!team) return null;
    return Array.isArray(team) ? team[0] ?? null : team;
  };

  const rawMatches = (matchesData ?? []) as any[];
  const matches = rawMatches.map(
    (match) =>
      ({
        ...match,
        home_team: normalizeTeam(match.home_team),
        away_team: normalizeTeam(match.away_team),
      }) as MatchWithTeams
  );

  const recentMatches: TeamRecentMatch[] = [];
  const matchNotes: MatchNoteSummary[] = [];
  const matchIds: string[] = [];

  matches.forEach((match) => {
    matchIds.push(match.id);
    const isHome = match.home_team_id === teamId;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;
    const opponent = isHome ? match.away_team : match.home_team;

    const outcome = teamScore === opponentScore ? 'D' : teamScore > opponentScore ? 'W' : 'L';

    recentMatches.push({
      matchId: match.id,
      matchDate: match.match_date,
      opponent: {
        id: opponent?.id ?? '',
        name: opponent?.name ?? 'Opponent',
        shortName: opponent?.short_name ?? opponent?.name ?? 'Opponent',
      },
      isHome,
      teamScore,
      opponentScore,
      outcome,
      notes: match.notes,
    });

    if (match.notes) {
      matchNotes.push({
        matchId: match.id,
        matchDate: match.match_date,
        note: match.notes,
      });
    }
  });

  const limitedRecentMatches = recentMatches.slice(0, 5);

  let topScorers: TeamScorerRow[] = [];
  if (matchIds.length > 0) {
    const { data: goals, error: goalsError } = await supabase
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
      .eq('team_id', teamId)
      .in('match_id', matchIds)
      .eq('is_own_goal', false);

    if (goalsError) {
      throw new Error(`Failed to load goal scorers: ${goalsError.message}`);
    }

    const tallies = new Map<string, { playerId: string; playerName: string; goals: number; matchIds: Set<string> }>();

    const normalizedGoals = (goals ?? []).map((goal) => ({
      ...goal,
      player: Array.isArray(goal.player) ? goal.player[0] ?? null : goal.player,
    }));

    normalizedGoals.forEach((goal) => {
      if (goal.is_own_goal || !goal.player || !goal.player_id) {
        return;
      }

      const existing = tallies.get(goal.player_id);
      if (existing) {
        existing.goals += 1;
        existing.matchIds.add(goal.match_id);
      } else {
        tallies.set(goal.player_id, {
          playerId: goal.player_id,
          playerName: formatPlayerDisplayName(goal.player.name),
          goals: 1,
          matchIds: new Set([goal.match_id]),
        });
      }
    });

    topScorers = Array.from(tallies.values())
      .map((entry) => ({
        playerId: entry.playerId,
        playerName: entry.playerName,
        goals: entry.goals,
        matchesWithGoal: entry.matchIds.size,
      }))
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.playerName.localeCompare(b.playerName);
      });
  }

  return {
    team,
    division: division ?? null,
    record,
    recentMatches: limitedRecentMatches,
    topScorers,
    matchNotes,
  };
}
