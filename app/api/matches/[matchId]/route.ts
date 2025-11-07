import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
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

export async function PUT(request: Request, { params }: { params: { matchId: string } }) {
  const { matchId } = params;

  if (!matchId) {
    return NextResponse.json({ error: 'Match ID is required.' }, { status: 400 });
  }

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

    const { error: updateError } = await supabase
      .from('matches')
      .update({
        division_id: payload.division_id,
        match_date: payload.match_date,
        home_team_id: payload.home_team_id,
        away_team_id: payload.away_team_id,
        home_score: payload.home_score,
        away_score: payload.away_score,
        notes: payload.notes,
      })
      .eq('id', matchId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: deleteGoalsError } = await supabase.from('goals').delete().eq('match_id', matchId);
    if (deleteGoalsError) {
      return NextResponse.json({ error: deleteGoalsError.message }, { status: 500 });
    }

    const goalsToInsert =
      payload.goals?.filter((goal) => goal.team_id)?.map((goal: NewGoalPayload) => ({
        match_id: matchId,
        team_id: goal.team_id,
        player_id: goal.player_id ?? null,
        minute: goal.minute ?? null,
        is_own_goal: goal.is_own_goal ?? false,
      })) ?? [];

    if (goalsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('goals').insert(goalsToInsert);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: matchId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { matchId: string } }) {
  const { matchId } = params;

  if (!matchId) {
    return NextResponse.json({ error: 'Match ID is required.' }, { status: 400 });
  }

  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();

    const { error: deleteGoalsError } = await supabase.from('goals').delete().eq('match_id', matchId);
    if (deleteGoalsError) {
      return NextResponse.json({ error: deleteGoalsError.message }, { status: 500 });
    }

    const { error: deleteMatchError } = await supabase.from('matches').delete().eq('id', matchId);
    if (deleteMatchError) {
      return NextResponse.json({ error: deleteMatchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}
