import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/adminAuth';
import type { NewHeadlinePayload } from '@/lib/types';

function validateHeadline(payload: NewHeadlinePayload): string | null {
  if (!payload.division_id) return 'Division is required.';
  if (!payload.title) return 'Headline title is required.';
  return null;
}

// GET /api/headlines/[headlineId] - Retrieve specific headline
export async function GET(
  request: Request,
  { params }: { params: { headlineId: string } }
) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('headlines')
      .select(`
        *,
        matches (
          id,
          home_team:teams!home_team_id(name, short_name),
          away_team:teams!away_team_id(name, short_name),
          match_date
        ),
        divisions (name)
      `)
      .eq('id', params.headlineId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Headline not found.' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}

// PUT /api/headlines/[headlineId] - Update specific headline
export async function PUT(
  request: Request,
  { params }: { params: { headlineId: string } }
) {
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
      .update({
        division_id: payload.division_id,
        match_id: payload.match_id,
        title: payload.title,
        body: payload.body,
      })
      .eq('id', params.headlineId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Headline not found.' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}

// DELETE /api/headlines/[headlineId] - Delete specific headline
export async function DELETE(
  request: Request,
  { params }: { params: { headlineId: string } }
) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from('headlines')
      .delete()
      .eq('id', params.headlineId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Headline not found.' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}