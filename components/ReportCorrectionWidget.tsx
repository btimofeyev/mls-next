'use client';

import { useMemo, useState } from 'react';
import type { Division } from '@/lib/types';
import styles from './ReportCorrectionWidget.module.css';

type ReportCorrectionWidgetProps = {
  divisions: Division[];
};

type FormState = {
  contactName: string;
  contactEmail: string;
  contactRole: string;
  divisionId: string;
  teamName: string;
  category: 'score_update' | 'goal_update' | 'general';
  message: string;
};

const CATEGORY_OPTIONS = [
  { value: 'score_update', label: 'Score correction' },
  { value: 'goal_update', label: 'Goal / scorer update' },
  { value: 'general', label: 'General note' },
];

const initialFormState: FormState = {
  contactName: '',
  contactEmail: '',
  contactRole: '',
  divisionId: '',
  teamName: '',
  category: 'score_update',
  message: '',
};

export function ReportCorrectionWidget({ divisions }: ReportCorrectionWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sortedDivisions = useMemo(
    () => divisions.slice().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
    [divisions]
  );

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formState.contactName.trim()) {
      setError('Please include your name so we know who to follow up with.');
      return;
    }

    if (!formState.contactEmail.trim()) {
      setError('Email is required so we can reply with questions.');
      return;
    }

    if (!formState.message.trim()) {
      setError('Include a few details about the correction.');
      return;
    }

    setIsSubmitting(true);

    try {
      const division = sortedDivisions.find((d) => d.id === formState.divisionId);
      const payload = {
        contact_name: formState.contactName.trim(),
        contact_email: formState.contactEmail.trim(),
        contact_role: formState.contactRole.trim() || null,
        division_id: division?.id ?? null,
        division_name: division?.name ?? null,
        team_id: null,
        team_name: formState.teamName.trim() || null,
        category: formState.category,
        message: formState.message.trim(),
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Failed to send your note.');
      }

      setSuccess('Thanks! We received your note and will verify it shortly.');
      setFormState(initialFormState);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setIsOpen(true)}
      >
        Report update
      </button>

      {isOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.panel}>
            <header className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Need a fix?</p>
                <h2 className={styles.title}>Submit a correction</h2>
                <p className={styles.subtitle}>
                  We usually verify updates within a day. Please include as many details as possible.
                </p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label>
                  Contact name
                  <input
                    type="text"
                    value={formState.contactName}
                    onChange={(event) => handleFieldChange('contactName', event.target.value)}
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={formState.contactEmail}
                    onChange={(event) => handleFieldChange('contactEmail', event.target.value)}
                    required
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Role (coach, parent, etc.)
                  <input
                    type="text"
                    value={formState.contactRole}
                    onChange={(event) => handleFieldChange('contactRole', event.target.value)}
                    placeholder="Optional"
                  />
                </label>

                <label>
                  Division
                  <select
                    value={formState.divisionId}
                    onChange={(event) => handleFieldChange('divisionId', event.target.value)}
                  >
                    <option value="">Select division (optional)</option>
                    {sortedDivisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Team name
                <input
                  type="text"
                  value={formState.teamName}
                  onChange={(event) => handleFieldChange('teamName', event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label>
                What needs updating?
                <select
                  value={formState.category}
                  onChange={(event) =>
                    handleFieldChange('category', event.target.value as FormState['category'])
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Details
                <textarea
                  value={formState.message}
                  onChange={(event) => handleFieldChange('message', event.target.value)}
                  rows={5}
                  required
                />
              </label>

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className={styles.success}>
                  {success}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.secondaryButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending…' : 'Send update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
