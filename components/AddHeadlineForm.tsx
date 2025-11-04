'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';
import { Surface } from '@/components/ui/Surface';
import type { Division, Match, NewHeadlinePayload } from '@/lib/types';

type MatchOption = Pick<Match, 'id' | 'match_date' | 'home_team_id' | 'away_team_id'> & {
  home_team?: {
    short_name: string;
  } | null;
  away_team?: {
    short_name: string;
  } | null;
};

type DivisionOption = Pick<Division, 'id' | 'name'>;


export function AddHeadlineForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [divisionId, setDivisionId] = useState('');
  const [matchId, setMatchId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
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
      setMatchId('');
      return;
    }

    let isMounted = true;
    supabase
      .from('matches')
      .select(
        `
        id,
        match_date,
        home_team_id,
        away_team_id,
        home_team:home_team_id (
          short_name
        ),
        away_team:away_team_id (
          short_name
        )
      `
      )
      .eq('division_id', divisionId)
      .order('match_date', { ascending: false })
      .limit(20)
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError(`Failed to load matches: ${fetchError.message}`);
          setMatches([]);
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
  }, [divisionId, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!divisionId) {
      setError('Select a division.');
      return;
    }
    if (!title.trim()) {
      setError('Enter a headline title.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: NewHeadlinePayload = {
        division_id: divisionId,
        match_id: matchId || null,
        title: title.trim(),
        body: body.trim() || null,
      };

      const accessToken = await getAdminAccessToken(supabase);

      const response = await fetch('/api/headlines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const bodyJson = await response.json().catch(() => null);
        throw new Error(bodyJson?.error ?? 'Failed to add headline.');
      }

      setSuccess('Headline posted successfully.');
      router.push('/admin');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to add headline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit}>
      <Surface padding="lg">
        <div>
          <h2>Headline Details</h2>
          <p>
            Spotlight key storylines within minutes of the final whistle.
          </p>
        </div>

        <div>
          <div>
            <label>Division</label>
            <select
              value={divisionId}
              onChange={(event) => setDivisionId(event.target.value)}
            >
              <option value="">Select division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Match (optional)</label>
            <select
              value={matchId}
              onChange={(event) => setMatchId(event.target.value)}
              disabled={!divisionId}
            >
              <option value="">No match selected</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.home_team?.short_name ?? 'Home'} vs {match.away_team?.short_name ?? 'Away'} — {match.match_date}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Headline title"
          />
        </div>

        <div>
          <label>Body</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Add context or summary (optional)"
          />
        </div>

        {(error || success) && (
          <div>
            {error ?? success}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Headline'}
          </button>
        </div>
      </Surface>
    </form>
  );
}
