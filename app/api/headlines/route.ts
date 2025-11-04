import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import type { NewHeadlinePayload } from '@/lib/types';

function validateHeadline(payload: NewHeadlinePayload): string | null {
  if (!payload.division_id) return 'Division is required.';
  if (!payload.title) return 'Headline title is required.';
  return null;
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as NewHeadlinePayload;
    const validationError = validateHeadline(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('headlines')
      .insert({
        division_id: payload.division_id,
        match_id: payload.match_id,
        title: payload.title,
        body: payload.body,
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Failed to add headline.' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}
