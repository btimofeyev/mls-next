'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';
import { Surface } from '@/components/ui/Surface';
import type { Division, NewPlayerPayload, Team } from '@/lib/types';

type PlayerFormMode = 'create' | 'edit';

type PlayerFormInitialData = {
  divisionId: string;
  teamId: string;
  name: string;
  number: string | null;
  position: string | null;
};

type PlayerFormProps = {
  mode: PlayerFormMode;
  playerId?: string;
  initialData?: PlayerFormInitialData;
};

type DivisionOption = Pick<Division, 'id' | 'name'>;
type TeamOption = Pick<Team, 'id' | 'name' | 'short_name' | 'division_id'>;


export function PlayerForm({ mode, playerId, initialData }: PlayerFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const initialDivisionRef = useRef(initialData?.divisionId ?? '');
  const baseFieldId = useId();
  const fieldIds = {
    division: `${baseFieldId}-division`,
    team: `${baseFieldId}-team`,
    name: `${baseFieldId}-name`,
    number: `${baseFieldId}-number`,
    position: `${baseFieldId}-position`,
  };

  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [divisionId, setDivisionId] = useState(initialData?.divisionId ?? '');
  const [teamId, setTeamId] = useState(initialData?.teamId ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [number, setNumber] = useState(initialData?.number ?? '');
  const [position, setPosition] = useState(initialData?.position ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      setTeams([]);
      setTeamId('');
      return;
    }

    let isMounted = true;
    supabase
      .from('teams')
      .select('id, name, short_name, division_id')
      .eq('division_id', divisionId)
      .order('short_name')
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError(`Failed to load teams: ${fetchError.message}`);
          setTeams([]);
          return;
        }

        setTeams((data ?? []) as TeamOption[]);
        if (divisionId !== initialDivisionRef.current || mode === 'create') {
          setTeamId('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [divisionId, mode, supabase]);

  const validate = () => {
    if (!divisionId) {
      setError('Select a division.');
      return false;
    }
    if (!teamId) {
      setError('Select a team.');
      return false;
    }
    if (!name.trim()) {
      setError('Enter the player name.');
      return false;
    }
    if (mode === 'edit' && !playerId) {
      setError('Missing player identifier.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: NewPlayerPayload = {
        team_id: teamId,
        name: name.trim(),
        number: number.trim() || null,
        position: position.trim() || null,
      };

      const endpoint = mode === 'create' ? '/api/players' : `/api/players/${playerId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const accessToken = await getAdminAccessToken(supabase);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? (mode === 'create' ? 'Failed to add player.' : 'Failed to update player.'));
      }

      setSuccess(mode === 'create' ? 'Player added successfully.' : 'Player updated successfully.');
      router.push('/admin/players');
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === 'create'
            ? 'Failed to add player.'
            : 'Failed to update player.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!playerId) return;
    if (typeof window !== 'undefined' && !window.confirm('Remove this player from the roster?')) {
      return;
    }
    setError(null);
    setSuccess(null);
    setIsDeleting(true);

    try {
      const accessToken = await getAdminAccessToken(supabase);

      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to delete player.');
      }

      router.push('/admin/players');
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete player.');
    } finally {
      setIsDeleting(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="admin-content-stack">
      <Surface padding="lg">
        <div className="form-header">
          <h2>
            {mode === 'create' ? 'Player Details' : 'Edit Player'}
          </h2>
          <p className="text-secondary">
            {mode === 'create'
              ? 'Register a new player and connect them to their club.'
              : 'Update roster information to keep player records current.'}
          </p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor={fieldIds.division}>Division</label>
            <select
              id={fieldIds.division}
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

          <div className="form-field">
            <label htmlFor={fieldIds.team}>Team</label>
            <select
              id={fieldIds.team}
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              disabled={!divisionId}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.short_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.name}>Player Name</label>
            <input
              id={fieldIds.name}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Player full name"
            />
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.number}>Number</label>
            <input
              id={fieldIds.number}
              type="text"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="Jersey number (optional)"
            />
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.position}>Position</label>
            <input
              id={fieldIds.position}
              type="text"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="Position (optional)"
            />
          </div>
        </div>
      </Surface>

      {(error || success) && (
        <Surface padding="lg" variant="muted">
          {error ? <p>{error}</p> : <p>{success}</p>}
        </Surface>
      )}
      {!error && !success && (
        <Surface padding="lg" variant="muted">
          {mode === 'create'
            ? 'Fill in the details above and save the new player.'
            : 'Update roster information to keep player records accurate.'}
        </Surface>
      )}

      <div className="form-actions">
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing...' : 'Delete Player'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Saving...'
              : 'Updating...'
            : mode === 'create'
              ? 'Save Player'
              : 'Update Player'}
        </button>
      </div>
    </form>
  );
}
