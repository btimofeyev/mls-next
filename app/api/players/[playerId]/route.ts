import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import type { NewPlayerPayload } from '@/lib/types';

function validatePlayer(payload: NewPlayerPayload): string | null {
  if (!payload.team_id) return 'Team is required.';
  if (!payload.name) return 'Player name is required.';
  return null;
}

export async function PATCH(request: Request, { params }: { params: { playerId: string } }) {
  const { playerId } = params;
  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 });
  }

  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as NewPlayerPayload;
    const validationError = validatePlayer(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from('players')
      .update({
        team_id: payload.team_id,
        name: payload.name,
        number: payload.number,
        position: payload.position,
      })
      .eq('id', playerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: playerId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { playerId: string } }) {
  const { playerId } = params;
  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 });
  }

  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('players').delete().eq('id', playerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: playerId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}
