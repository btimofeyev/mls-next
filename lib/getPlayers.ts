import { cache } from 'react';
import { createSupabaseServerClient } from './supabaseClient';
import type { AdminPlayerDetail } from './types';

export const getPlayersForDivision = cache(
  async (divisionId: string): Promise<AdminPlayerDetail[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('players')
      .select(
        `
        id,
        team_id,
        name,
        number,
        position,
        team:team_id (
          id,
          name,
          short_name,
          division_id
        )
      `
      )
      .eq('team.division_id', divisionId)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch players: ${error.message}`);
    }

    return (data ?? []).map((player) => {
      const team = player.team;
      const normalizedTeam = Array.isArray(team) ? team[0] ?? null : team;
      return {
        id: player.id,
        team_id: player.team_id,
        name: player.name,
        number: player.number,
        position: player.position,
        team: normalizedTeam,
      } as AdminPlayerDetail;
    });
  }
);

export const getPlayerWithTeam = cache(async (playerId: string): Promise<AdminPlayerDetail | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('players')
    .select(
      `
      id,
      team_id,
      name,
      number,
      position,
      team:team_id (
        id,
        name,
        short_name,
        division_id
      )
    `
    )
    .eq('id', playerId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch player: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const normalizedTeam = Array.isArray(data.team) ? data.team[0] ?? null : data.team;

  return {
    id: data.id,
    team_id: data.team_id,
    name: data.name,
    number: data.number,
    position: data.position,
    team: normalizedTeam,
  } as AdminPlayerDetail;
});
