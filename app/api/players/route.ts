import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import type { NewPlayerPayload } from '@/lib/types';

function validatePlayer(payload: NewPlayerPayload): string | null {
  if (!payload.team_id) return 'Team is required.';
  if (!payload.name) return 'Player name is required.';
  return null;
}

export async function POST(request: Request) {
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

    const { data, error } = await supabase
      .from('players')
      .insert({
        team_id: payload.team_id,
        name: payload.name,
        number: payload.number,
        position: payload.position,
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Failed to add player.' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}
