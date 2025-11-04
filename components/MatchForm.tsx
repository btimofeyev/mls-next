'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';
import { Surface } from '@/components/ui/Surface';
import type { Division, NewMatchPayload, Player, Team } from '@/lib/types';

type MatchFormMode = 'create' | 'edit';

type MatchFormInitialGoal = {
  id?: string;
  minute: number | null;
  teamId: string;
  playerId: string | null;
  isOwnGoal: boolean;
};

type MatchFormInitialData = {
  divisionId: string;
  matchDate: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  notes: string | null;
  goals: MatchFormInitialGoal[];
};

type MatchFormProps = {
  mode: MatchFormMode;
  matchId?: string;
  initialData?: MatchFormInitialData;
};

type GoalRow = {
  id: string;
  minute: string;
  teamId: string;
  playerId: string;
  isOwnGoal: boolean;
};

type DivisionOption = Pick<Division, 'id' | 'name' | 'short_name'>;
type TeamOption = Pick<Team, 'id' | 'name' | 'short_name' | 'division_id'>;
type PlayerOption = Pick<Player, 'id' | 'name' | 'team_id' | 'number' | 'position'>;

const UNKNOWN_PLAYER_VALUE = 'unknown';

const createGoalRow = (): GoalRow => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  minute: '',
  teamId: '',
  playerId: '',
  isOwnGoal: false,
});


export function MatchForm({ mode, matchId, initialData }: MatchFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const initialDivisionIdRef = useRef(initialData?.divisionId ?? '');
  const baseFieldId = useId();
  const fieldIds = {
    division: `${baseFieldId}-division`,
    matchDate: `${baseFieldId}-match-date`,
    homeTeam: `${baseFieldId}-home-team`,
    awayTeam: `${baseFieldId}-away-team`,
    homeScore: `${baseFieldId}-home-score`,
    awayScore: `${baseFieldId}-away-score`,
    notes: `${baseFieldId}-notes`,
  };

  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, PlayerOption[]>>({});

  const [divisionId, setDivisionId] = useState(initialData?.divisionId ?? '');
  const [matchDate, setMatchDate] = useState(initialData?.matchDate ?? '');
  const [homeTeamId, setHomeTeamId] = useState(initialData?.homeTeamId ?? '');
  const [awayTeamId, setAwayTeamId] = useState(initialData?.awayTeamId ?? '');
  const [homeScore, setHomeScore] = useState(initialData?.homeScore.toString() ?? '');
  const [awayScore, setAwayScore] = useState(initialData?.awayScore.toString() ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [goals, setGoals] = useState<GoalRow[]>(() => {
    if (initialData?.goals?.length) {
      return initialData.goals.map((goal) => ({
        id: goal.id ?? createGoalRow().id,
        minute: goal.minute != null ? String(goal.minute) : '',
        teamId: goal.teamId,
        playerId: goal.playerId ?? UNKNOWN_PLAYER_VALUE,
        isOwnGoal: goal.isOwnGoal,
      }));
    }
    return [createGoalRow()];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    supabase
      .from('divisions')
      .select('id, name, short_name')
      .order('name')
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setFormError(`Failed to load divisions: ${error.message}`);
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
      setPlayersByTeam({});
      if (mode === 'create') {
        setHomeTeamId('');
        setAwayTeamId('');
      }
      return;
    }

    let isMounted = true;
    setFormError(null);

    supabase
      .from('teams')
      .select('id, name, short_name, division_id')
      .eq('division_id', divisionId)
      .order('short_name')
      .then(async ({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setFormError(`Failed to load teams: ${error.message}`);
          setTeams([]);
          setPlayersByTeam({});
          return;
        }

        const fetchedTeams = (data ?? []) as TeamOption[];
        setTeams(fetchedTeams);

        if (divisionId !== initialDivisionIdRef.current || mode === 'create') {
          setHomeTeamId('');
          setAwayTeamId('');
        }

        const teamIds = fetchedTeams.map((team) => team.id);
        if (teamIds.length === 0) {
          setPlayersByTeam({});
          return;
        }

        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name, team_id, number, position')
          .in('team_id', teamIds)
          .order('name');

        if (!isMounted) return;

        if (playersError) {
          setFormError(`Failed to load players: ${playersError.message}`);
          setPlayersByTeam({});
          return;
        }

        const grouped: Record<string, PlayerOption[]> = {};
        ((players ?? []) as PlayerOption[]).forEach((player) => {
          if (!grouped[player.team_id]) {
            grouped[player.team_id] = [];
          }
          grouped[player.team_id].push(player);
        });
        setPlayersByTeam(grouped);
      });

    return () => {
      isMounted = false;
    };
  }, [divisionId, mode, supabase]);

  const handleAddGoalRow = () => {
    setGoals((prev) => [...prev, createGoalRow()]);
  };

  const handleRemoveGoalRow = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const handleGoalChange = (id: string, field: keyof GoalRow, value: string | boolean) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== id) return goal;
        if (field === 'isOwnGoal') {
          return { ...goal, isOwnGoal: value as boolean };
        }
        if (field === 'teamId') {
          return { ...goal, teamId: value as string, playerId: '' };
        }
        return { ...goal, [field]: value };
      })
    );
  };

  const validateForm = (): string | null => {
    if (!divisionId) return 'Select a division.';
    if (!matchDate) return 'Select a match date.';
    if (!homeTeamId || !awayTeamId) return 'Select both home and away teams.';
    if (homeTeamId === awayTeamId) return 'Home and away teams must be different.';
    if (homeScore === '' || awayScore === '') return 'Enter final scores for both teams.';
    if (mode === 'edit' && !matchId) return 'Missing match identifier.';
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: NewMatchPayload = {
        division_id: divisionId,
        match_date: matchDate,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        notes: notes.trim() ? notes.trim() : null,
        goals: goals
          .filter((goal) => goal.teamId)
          .map((goal) => ({
            minute: goal.minute ? Number(goal.minute) : null,
            team_id: goal.teamId,
            player_id: goal.playerId && goal.playerId !== UNKNOWN_PLAYER_VALUE ? goal.playerId : null,
            is_own_goal: goal.isOwnGoal,
          })),
      };

      const endpoint = mode === 'create' ? '/api/matches' : `/api/matches/${matchId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

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
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Failed to save match.');
      }

      setFormSuccess(mode === 'create' ? 'Match saved successfully.' : 'Match updated successfully.');
      router.push('/admin/matches');
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save match.');
    } finally {
      setIsLoading(false);
    }
  };

  const homeTeam = teams.find((team) => team.id === homeTeamId);
  const awayTeam = teams.find((team) => team.id === awayTeamId);

  
  const renderGoalRow = (goal: GoalRow) => {
    const teamOptions = [
      homeTeam && { id: homeTeam.id, label: `Home – ${homeTeam.short_name}` },
      awayTeam && { id: awayTeam.id, label: `Away – ${awayTeam.short_name}` },
    ].filter(Boolean) as { id: string; label: string }[];

    const players = goal.teamId && playersByTeam[goal.teamId] ? playersByTeam[goal.teamId] : [];

    return (
      <div
        key={goal.id}
        className="goal-row"
      >
        <div className="goal-row-grid">
          <div className="form-field">
            <label htmlFor={`goal-${goal.id}-minute`}>Minute</label>
            <input
              id={`goal-${goal.id}-minute`}
              type="number"
              min={0}
              max={150}
              value={goal.minute}
              onChange={(event) => handleGoalChange(goal.id, 'minute', event.target.value)}
              placeholder="e.g. 53"
                          />
          </div>

          <div className="form-field">
            <label htmlFor={`goal-${goal.id}-team`}>Scoring Team</label>
            <select
              id={`goal-${goal.id}-team`}
              value={goal.teamId}
              onChange={(event) => handleGoalChange(goal.id, 'teamId', event.target.value)}
                          >
              <option value="">Select team</option>
              {teamOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor={`goal-${goal.id}-player`}>Player</label>
            <select
              id={`goal-${goal.id}-player`}
              value={goal.playerId}
              onChange={(event) => handleGoalChange(goal.id, 'playerId', event.target.value)}
              disabled={!goal.teamId}
                          >
              <option value="">Select player</option>
              <option value={UNKNOWN_PLAYER_VALUE}>[Unknown / Not Listed]</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="goal-row-meta">
          <label className="goal-own-goal">
            <input
              type="checkbox"
              checked={goal.isOwnGoal}
              onChange={(event) => handleGoalChange(goal.id, 'isOwnGoal', event.target.checked)}
                          />
            Own Goal
          </label>
          {goals.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveGoalRow(goal.id)}
              className="goal-remove"
                          >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="admin-content-stack">
      <Surface padding="lg">
        <div className="form-header">
          <h2>
            Match Info
          </h2>
          <p className="text-secondary">
            Log the essentials before attributing goals. Everything updates the public dashboard instantly.
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
            <label htmlFor={fieldIds.matchDate}>Match Date</label>
            <input
              id={fieldIds.matchDate}
              type="date"
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.homeTeam}>Home Team</label>
            <select
              id={fieldIds.homeTeam}
              value={homeTeamId}
              onChange={(event) => setHomeTeamId(event.target.value)}
              disabled={!divisionId}
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.short_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.awayTeam}>Away Team</label>
            <select
              id={fieldIds.awayTeam}
              value={awayTeamId}
              onChange={(event) => setAwayTeamId(event.target.value)}
              disabled={!divisionId}
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.short_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.homeScore}>Home Score</label>
            <input
              id={fieldIds.homeScore}
              type="number"
              min={0}
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.awayScore}>Away Score</label>
            <input
              id={fieldIds.awayScore}
              type="number"
              min={0}
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
            />
          </div>
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor={fieldIds.notes}>Notes</label>
          <textarea
            id={fieldIds.notes}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Add match notes (optional)"
          />
        </div>
      </Surface>

      <Surface padding="lg">
        <div className="goal-header">
          <h2>Goal Log</h2>
          <button
            type="button"
            onClick={handleAddGoalRow}
          >
            + Add goal
          </button>
        </div>

        <div className="goal-rows">
          {goals.map((goal) => renderGoalRow(goal))}
        </div>
      </Surface>

      {(formError || formSuccess) && (
        <Surface padding="lg" variant="muted">
          {formError ? (
            <p>{formError}</p>
          ) : (
            <p>{formSuccess}</p>
          )}
        </Surface>
      )}

      {!formError && !formSuccess && (
        <Surface padding="lg" variant="muted">
          Review the details above before {mode === 'create' ? 'saving' : 'updating'} the match.
        </Surface>
      )}

      <div className="form-actions">
        <button
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? mode === 'create'
              ? 'Saving...'
              : 'Updating...'
            : mode === 'create'
              ? 'Save Match'
              : 'Update Match'}
        </button>
      </div>
    </form>
  );
}
