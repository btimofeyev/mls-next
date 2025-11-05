'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';
import { Surface } from '@/components/ui/Surface';
import type { Division, Match, NewHeadlinePayload, HeadlineWithDetails } from '@/lib/types';

type MatchOption = Pick<Match, 'id' | 'match_date' | 'home_team_id' | 'away_team_id'> & {
  home_team?: {
    short_name: string;
  } | null;
  away_team?: {
    short_name: string;
  } | null;
};

type DivisionOption = Pick<Division, 'id' | 'name'>;

type EditHeadlineFormProps = {
  headlineId: string;
  initialData: HeadlineWithDetails;
};

export function EditHeadlineForm({ headlineId, initialData }: EditHeadlineFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [divisionId, setDivisionId] = useState(initialData.division_id);
  const [matchId, setMatchId] = useState(initialData.match_id || '');
  const [title, setTitle] = useState(initialData.title);
  const [body, setBody] = useState(initialData.body || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    supabase
      .from('divisions')
      .select('id, name')
      .order('name')
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError(`Failed to load divisions: ${fetchError.message}`);
          return;
        }
        setDivisions((data ?? []) as DivisionOption[]);
      });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!divisionId) {
      setMatches([]);
      return;
    }

    let isMounted = true;
    supabase
      .from('matches')
      .select(`
        id,
        match_date,
        home_team_id,
        away_team_id,
        home_team:teams!home_team_id(short_name),
        away_team:teams!away_team_id(short_name)
      `)
      .eq('division_id', divisionId)
      .order('match_date', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError(`Failed to load matches: ${fetchError.message}`);
          return;
        }
        const normalizedMatches = (data ?? []).map((match) => ({
          ...match,
          home_team: Array.isArray(match.home_team) ? match.home_team[0] ?? null : match.home_team,
          away_team: Array.isArray(match.away_team) ? match.away_team[0] ?? null : match.away_team,
        })) as MatchOption[];
        setMatches(normalizedMatches);
      });

    return () => {
      isMounted = false;
    };
  }, [supabase, divisionId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const accessToken = await getAdminAccessToken(supabase);

    const payload: NewHeadlinePayload = {
      division_id: divisionId,
      match_id: matchId || null,
      title: title.trim(),
      body: body.trim() || null,
    };

    try {
      const response = await fetch(`/api/headlines/${headlineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update headline');
      }

      setSuccess('Headline updated successfully!');
      setTimeout(() => {
        router.push('/admin/headlines');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Surface padding="lg" variant="muted">
      <form onSubmit={onSubmit} className="admin-form-stack">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="division">Division</label>
          <select
            id="division"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">Select division</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="match">Match (optional)</label>
          <select
            id="match"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            disabled={isSubmitting || !divisionId}
          >
            <option value="">No specific match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.home_team?.short_name ?? 'Home'} vs {match.away_team?.short_name ?? 'Away'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Headline Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter headline title"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Body (optional)</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter detailed content for this headline"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !divisionId.trim() || !title.trim()}
          >
            {isSubmitting ? 'Updating...' : 'Update Headline'}
          </button>
        </div>
      </form>
    </Surface>
  );
}