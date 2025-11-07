'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import type { AdminMatchDetail } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';

type AdminMatchesTableProps = {
  matches: AdminMatchDetail[];
};

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

function matchIncludesQuery(match: AdminMatchDetail, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const fields = [
    match.home_team?.name,
    match.home_team?.short_name,
    match.away_team?.name,
    match.away_team?.short_name,
  ];

  return fields.some((value) => value?.toLowerCase().includes(normalizedQuery));
}

export function AdminMatchesTable({ matches }: AdminMatchesTableProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchInputId = useId();

  const [matchList, setMatchList] = useState(matches);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMatchList(matches);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) {
      return matchList;
    }
    return matchList.filter((match) => matchIncludesQuery(match, searchQuery));
  }, [matchList, searchQuery]);

  const totalCount = matchList.length;
  const filteredCount = filteredMatches.length;
  const trimmedQuery = searchQuery.trim();

  const handleDelete = async (match: AdminMatchDetail) => {
    if (isDeletingId) {
      return;
    }

    const fixtureLabel = `${match.home_team?.short_name ?? 'Home'} vs ${match.away_team?.short_name ?? 'Away'}`;
    const confirmed = window.confirm(`Delete match ${fixtureLabel}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setIsDeletingId(match.id);

    try {
      const accessToken = await getAdminAccessToken(supabase);
      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Failed to delete match.');
      }

      setMatchList((prev) => prev.filter((row) => row.id !== match.id));
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete match.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="table-wrapper">
      <div className="admin-table-controls">
        <div className="admin-table-search">
          <label htmlFor={searchInputId}>
            Search matches
          </label>
          <input
            id={searchInputId}
            type="text"
            value={searchQuery}
            placeholder="Start typing a club name…"
            onChange={(event) => setSearchQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="admin-table-meta">
          Showing <strong>{filteredCount}</strong> of {totalCount} matches
        </div>
      </div>
      {actionError && (
        <div className="admin-table-error" role="alert">
          {actionError}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Fixture</th>
            <th scope="col">Score</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => {
              const fixtureLabel = `${match.home_team?.short_name ?? 'Home'} vs ${match.away_team?.short_name ?? 'Away'}`;
              return (
                <tr
                  key={match.id}
                >
                  <td>{formatDate(match.match_date)}</td>
                  <td>
                    {fixtureLabel}
                  </td>
                  <td>
                    {match.home_score} — {match.away_score}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        href={`/admin/matches/${match.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(match)}
                        className="admin-table-delete"
                        disabled={isDeletingId === match.id}
                      >
                        {isDeletingId === match.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4}>
                {trimmedQuery
                  ? `No matches found for "${trimmedQuery}".`
                  : 'No matches recorded yet.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
