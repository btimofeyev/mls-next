import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { fetchLatestResults } from '@/lib/getLatestResults';
import type { NewGoalPayload, NewMatchPayload } from '@/lib/types';

function validatePayload(payload: NewMatchPayload): string | null {
  if (!payload.division_id) return 'Division is required.';
  if (!payload.match_date) return 'Match date is required.';
  if (!payload.home_team_id || !payload.away_team_id) return 'Both home and away teams are required.';
  if (payload.home_team_id === payload.away_team_id) return 'Home and away teams must be different.';
  if (typeof payload.home_score !== 'number' || typeof payload.away_score !== 'number') {
    return 'Home and away scores must be numbers.';
  }
  return null;
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as NewMatchPayload;
    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data: matchRow, error: matchError } = await supabase
      .from('matches')
      .insert({
        division_id: payload.division_id,
        match_date: payload.match_date,
        home_team_id: payload.home_team_id,
        away_team_id: payload.away_team_id,
        home_score: payload.home_score,
        away_score: payload.away_score,
        notes: payload.notes,
      })
      .select('id')
      .single();

    if (matchError || !matchRow) {
      return NextResponse.json({ error: matchError?.message ?? 'Failed to save match.' }, { status: 500 });
    }

    const goalsToInsert =
      payload.goals?.filter((goal) => goal.team_id)?.map((goal: NewGoalPayload) => ({
        match_id: matchRow.id,
        team_id: goal.team_id,
        player_id: goal.player_id ?? null,
        minute: goal.minute ?? null,
        is_own_goal: goal.is_own_goal ?? false,
      })) ?? [];

    if (goalsToInsert.length > 0) {
      const { error: goalsError } = await supabase.from('goals').insert(goalsToInsert);
      if (goalsError) {
        await supabase.from('matches').delete().eq('id', matchRow.id);
        return NextResponse.json({ error: goalsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: matchRow.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const divisionId = url.searchParams.get('divisionId') ?? DEFAULT_DIVISION_ID;
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Math.min(Number(limitParam) || 10, 50) : 10;

  try {
    const results = await fetchLatestResults(divisionId, limit);
    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load latest results.' },
      { status: 500 },
    );
  }
}
