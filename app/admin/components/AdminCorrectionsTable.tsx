'use client';

import { useMemo, useState } from 'react';
import type { ScoreCorrection, ScoreCorrectionStatus } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';

type AdminCorrectionsTableProps = {
  corrections: ScoreCorrection[];
};

const STATUS_OPTIONS: { value: ScoreCorrectionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In review' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_LABELS: Record<string, string> = {
  score_update: 'Score correction',
  goal_update: 'Goal/scorer update',
  general: 'General note',
};

export function AdminCorrectionsTable({ corrections }: AdminCorrectionsTableProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState(corrections);
  const [statusFilter, setStatusFilter] = useState<'all' | ScoreCorrectionStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') {
      return rows;
    }
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const handleUpdate = async (correctionId: string, updates: Partial<ScoreCorrection>) => {
    if (updatingId) return;
    setUpdatingId(correctionId);
    setError(null);

    try {
      const token = await getAdminAccessToken(supabase);
      const response = await fetch(`/api/contact/${correctionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: updates.status,
          notes: updates.notes,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to update correction.');
      }

      setRows((prev) =>
        prev.map((row) => (row.id === correctionId ? { ...row, ...updates } : row))
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update correction.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = (correctionId: string, status: ScoreCorrectionStatus) => {
    handleUpdate(correctionId, { status });
  };

  const handleNoteEdit = (correctionId: string, existingNote: string | null) => {
    const nextNote = window.prompt('Add an internal note', existingNote ?? '') ?? undefined;
    if (nextNote === undefined) {
      return;
    }
    handleUpdate(correctionId, { notes: nextNote || null });
  };

  return (
    <div className="table-wrapper">
      <div className="admin-table-controls">
        <div className="admin-table-search">
          <label htmlFor="status-filter">Filter by status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-table-meta">
          Showing <strong>{filteredRows.length}</strong> of {rows.length} submissions
        </div>
      </div>

      {error && (
        <div className="admin-table-error" role="alert">
          {error}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Contact</th>
            <th>Division / Team</th>
            <th>Category</th>
            <th>Message</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div>
                    <strong>{row.contact_name}</strong>
                  </div>
                  <div>{row.contact_email}</div>
                  {row.contact_role ? (
                    <div style={{ color: '#94a3b8' }}>
                      {row.contact_role}
                    </div>
                  ) : null}
                </td>
                <td>
                  <div>{row.division_name ?? '—'}</div>
                  <div style={{ color: '#94a3b8' }}>{row.team_name ?? '—'}</div>
                </td>
                <td>{CATEGORY_LABELS[row.category] ?? row.category}</td>
                <td>
                  <div style={{ whiteSpace: 'pre-line' }}>{row.message}</div>
                </td>
                <td>
                  <div className="admin-status-chip" data-status={row.status}>
                    {row.status === 'resolved' ? '✔ Resolved' : STATUS_OPTIONS.find((option) => option.value === row.status)?.label ?? row.status}
                  </div>
                  <div className="admin-table-actions">
                    {row.status !== 'resolved' ? (
                      <>
                        {row.status !== 'pending' && (
                          <button
                            type="button"
                            className="admin-status-button"
                            onClick={() => handleStatusChange(row.id, 'pending')}
                            disabled={updatingId === row.id}
                          >
                            Mark pending
                          </button>
                        )}
                        {row.status !== 'in_review' && (
                          <button
                            type="button"
                            className="admin-status-button"
                            onClick={() => handleStatusChange(row.id, 'in_review')}
                            disabled={updatingId === row.id}
                          >
                            In review
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-status-button admin-status-button-primary"
                          onClick={() => handleStatusChange(row.id, 'resolved')}
                          disabled={updatingId === row.id}
                        >
                          Resolve
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-status-button"
                        onClick={() => handleStatusChange(row.id, 'in_review')}
                        disabled={updatingId === row.id}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <span>{row.notes ?? '—'}</span>
                    <button
                      type="button"
                      className="admin-table-delete"
                      style={{ background: 'transparent', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#bfdbfe' }}
                      onClick={() => handleNoteEdit(row.id, row.notes)}
                      disabled={updatingId === row.id}
                    >
                      {row.notes ? 'Edit note' : 'Add note'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                {statusFilter === 'all'
                  ? 'No submissions yet.'
                  : 'No submissions match this status.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
