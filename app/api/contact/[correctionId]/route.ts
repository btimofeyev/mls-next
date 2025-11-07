import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import type { ScoreCorrectionStatus, UpdateScoreCorrectionPayload } from '@/lib/types';

const ALLOWED_STATUS: ScoreCorrectionStatus[] = ['pending', 'in_review', 'resolved'];

function validateUpdate(payload: UpdateScoreCorrectionPayload): string | null {
  if (!payload.status && payload.notes === undefined) {
    return 'Provide a status or note to update.';
  }

  if (payload.status && !ALLOWED_STATUS.includes(payload.status)) {
    return 'Invalid status value.';
  }

  if (payload.notes !== undefined && typeof payload.notes !== 'string' && payload.notes !== null) {
    return 'Notes must be text.';
  }

  return null;
}

export async function PATCH(request: Request, { params }: { params: { correctionId: string } }) {
  const { correctionId } = params;

  if (!correctionId) {
    return NextResponse.json({ error: 'Correction id is required.' }, { status: 400 });
  }

  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as UpdateScoreCorrectionPayload;
    const validationError = validateUpdate(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const updates: Record<string, unknown> = {};
    if (payload.status) {
      updates.status = payload.status;
    }
    if (payload.notes !== undefined) {
      updates.notes = payload.notes === null ? null : payload.notes.trim();
    }

    const { data, error } = await supabase
      .from('score_corrections')
      .update(updates)
      .eq('id', correctionId)
      .select('*')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update correction.' },
      { status: 500 }
    );
  }
}
