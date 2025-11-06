'use client';

import { useCallback, useId, useMemo, type ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Division } from '@/lib/types';
import styles from './DivisionSelector.module.css';

const FALLBACK_AGE_GROUP_LABEL = 'Other Divisions';

function getAgeGroupKey(value: string | null): string {
  if (!value) {
    return FALLBACK_AGE_GROUP_LABEL;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_AGE_GROUP_LABEL;
}

function extractAgeOrder(value: string): number {
  const match = value.match(/U(\d+)/i);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function compareAgeGroups(a: string, b: string): number {
  const orderDifference = extractAgeOrder(a) - extractAgeOrder(b);
  if (orderDifference !== 0) {
    return orderDifference;
  }
  return a.localeCompare(b);
}

function formatDivisionLabel(division: Division): string {
  return division.short_name?.trim() || division.name;
}

type DivisionSelectorProps = {
  divisions: Division[];
  selectedDivisionId: string;
  className?: string;
};

export function DivisionSelector({ divisions, selectedDivisionId, className }: DivisionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const componentId = useId();

  const groups = useMemo(() => {
    const map = new Map<string, Division[]>();

    divisions.forEach((division) => {
      const key = getAgeGroupKey(division.age_group);
      const existing = map.get(key);
      if (existing) {
        existing.push(division);
      } else {
        map.set(key, [division]);
      }
    });

    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        divisions: items
          .slice()
          .sort((a, b) => formatDivisionLabel(a).localeCompare(formatDivisionLabel(b))),
      }))
      .sort((a, b) => compareAgeGroups(a.key, b.key));
  }, [divisions]);

  const selectedDivision = useMemo(
    () => divisions.find((division) => division.id === selectedDivisionId) ?? null,
    [divisions, selectedDivisionId]
  );

  const selectedAgeGroupKey = selectedDivision
    ? getAgeGroupKey(selectedDivision.age_group)
    : groups[0]?.key ?? FALLBACK_AGE_GROUP_LABEL;

  const selectedGroup = useMemo(
    () => groups.find((group) => group.key === selectedAgeGroupKey) ?? groups[0] ?? null,
    [groups, selectedAgeGroupKey]
  );

  const divisionsForSelectedGroup = selectedGroup?.divisions ?? [];

  const containerClassName = className
    ? `${styles.selector} ${className}`
    : styles.selector;

  const ageGroupSelectId = `age-group-select-${componentId}`;
  const divisionSelectId = `division-select-${componentId}`;

  const pushToDivision = useCallback(
    (nextDivisionId: string) => {
      if (!nextDivisionId || nextDivisionId === selectedDivisionId) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      const dynamicMatch = pathname.match(/^\/(standings|leaderboard)\/[^/]+/);
      if (dynamicMatch) {
        const section = dynamicMatch[1];
        params.delete('divisionId');
        const queryString = params.toString();
        router.push(queryString ? `/${section}/${nextDivisionId}?${queryString}` : `/${section}/${nextDivisionId}`);
        return;
      }

      params.set('divisionId', nextDivisionId);

      const queryString = params.toString();
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(nextPath);
    },
    [pathname, router, searchParams, selectedDivisionId]
  );

  const handleAgeGroupChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextGroupKey = event.target.value;
      if (nextGroupKey === selectedAgeGroupKey) {
        return;
      }

      const nextGroup = groups.find((group) => group.key === nextGroupKey);
      const fallbackDivision = nextGroup?.divisions[0];
      if (fallbackDivision) {
        pushToDivision(fallbackDivision.id);
      }
    },
    [groups, pushToDivision, selectedAgeGroupKey]
  );

  const handleDivisionChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextDivisionId = event.target.value;
      pushToDivision(nextDivisionId);
    },
    [pushToDivision]
  );

  if (divisions.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <div className={styles.selectorHeader}>
        <span className={styles.selectorTitle}>Division Selector</span>
        <span className={styles.selectorDescription}>
          Choose an age group and division to update the dashboard.
        </span>
      </div>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={ageGroupSelectId} className={styles.label}>
            Age Group
          </label>
          <div className={styles.selectWrapper}>
            <select
              id={ageGroupSelectId}
              value={selectedAgeGroupKey}
              onChange={handleAgeGroupChange}
              className={styles.select}
              disabled={groups.length <= 1}
            >
              {groups.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.key}
                </option>
              ))}
            </select>
          </div>
          <span className={styles.helper}>
            {groups.length <= 1
              ? 'Only one age group is available right now.'
              : 'Switching age groups updates the available divisions.'}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor={divisionSelectId} className={styles.label}>
            Division
          </label>
          <div className={styles.selectWrapper}>
            <select
              id={divisionSelectId}
              value={selectedDivisionId}
              onChange={handleDivisionChange}
              className={styles.select}
              disabled={divisionsForSelectedGroup.length === 0}
            >
              {divisionsForSelectedGroup.map((division) => (
                <option key={division.id} value={division.id}>
                  {formatDivisionLabel(division)}
                </option>
              ))}
            </select>
          </div>
          <span className={styles.helper}>
            {selectedDivision
              ? selectedDivision.name
              : 'Select a division to refresh the dashboard.'}
          </span>
        </div>
      </div>
    </div>
  );
}
