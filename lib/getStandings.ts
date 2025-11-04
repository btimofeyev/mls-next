import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { Match, StandingRow, Team } from './types';

export const getStandings = cache(async (divisionId: string): Promise<StandingRow[]> => {
  const supabase = createSupabaseServerClient();

  const [{ data: teams, error: teamsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase.from('teams').select('id, name, short_name').eq('division_id', divisionId).order('short_name'),
    supabase.from('matches').select('id, home_team_id, away_team_id, home_score, away_score').eq('division_id', divisionId),
  ]);

  if (teamsError) {
    throw new Error(`Failed to load teams: ${teamsError.message}`);
  }

  if (matchesError) {
    throw new Error(`Failed to load matches: ${matchesError.message}`);
  }

  const standingsByTeam = new Map<string, StandingRow>();

  (teams ?? []).forEach((team: Pick<Team, 'id' | 'name' | 'short_name'>) => {
    standingsByTeam.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.short_name,
      gp: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      cleanSheets: 0,
      avgGoalsFor: 0,
      avgGoalsAgainst: 0,
    });
  });

  (matches ?? []).forEach((match: Pick<Match, 'home_team_id' | 'away_team_id' | 'home_score' | 'away_score'>) => {
    const home = standingsByTeam.get(match.home_team_id);
    const away = standingsByTeam.get(match.away_team_id);

    if (!home || !away) {
      return;
    }

    home.gp += 1;
    away.gp += 1;

    home.gf += match.home_score;
    home.ga += match.away_score;
    away.gf += match.away_score;
    away.ga += match.home_score;

    if (match.away_score === 0) {
      home.cleanSheets += 1;
    }

    if (match.home_score === 0) {
      away.cleanSheets += 1;
    }

    if (match.home_score > match.away_score) {
      home.w += 1;
      away.l += 1;
      home.points += 3;
    } else if (match.home_score < match.away_score) {
      away.w += 1;
      home.l += 1;
      away.points += 3;
    } else {
      home.d += 1;
      away.d += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  const rows = Array.from(standingsByTeam.values()).map((row) => ({
    ...row,
    gd: row.gf - row.ga,
    avgGoalsFor: row.gp > 0 ? Number((row.gf / row.gp).toFixed(2)) : 0,
    avgGoalsAgainst: row.gp > 0 ? Number((row.ga / row.gp).toFixed(2)) : 0,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.teamName.localeCompare(b.teamName);
  });

  return rows;
});
