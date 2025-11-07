import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { NewScoreCorrectionPayload, ScoreCorrectionCategory } from '@/lib/types';

const ALLOWED_CATEGORIES: ScoreCorrectionCategory[] = ['score_update', 'goal_update', 'general'];

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePayload(payload: NewScoreCorrectionPayload): string | null {
  const name = normalizeString(payload.contact_name);
  const email = normalizeString(payload.contact_email);
  const message = normalizeString(payload.message);
  const category = payload.category;

  if (!name) {
    return 'Your name is required.';
  }

  if (!email || !isValidEmail(email)) {
    return 'Enter a valid email address.';
  }

  if (!message || message.length < 10) {
    return 'Please include a few details so we can verify the update.';
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return 'Invalid submission category.';
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as NewScoreCorrectionPayload;
    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('score_corrections').insert({
      division_id: payload.division_id ?? null,
      division_name: payload.division_name ?? null,
      team_id: payload.team_id ?? null,
      team_name: payload.team_name ?? null,
      category: payload.category,
      contact_name: payload.contact_name.trim(),
      contact_email: payload.contact_email.trim(),
      contact_role: payload.contact_role?.trim() || null,
      message: payload.message.trim(),
      status: 'pending',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit correction.' },
      { status: 500 }
    );
  }
}
