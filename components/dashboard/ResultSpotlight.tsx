'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LatestResult } from '@/lib/types';

type ResultSpotlightProps = {
  results: LatestResult[];
  intervalMs?: number;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ResultSpotlight({ results, intervalMs = 8000 }: ResultSpotlightProps) {
  const safeResults = useMemo(() => results ?? [], [results]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeResults.length]);

  useEffect(() => {
    if (safeResults.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeResults.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [safeResults.length, intervalMs]);

  const current = safeResults[activeIndex] ?? null;

  if (!current) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-md bg-surface-elevated text-xs text-secondary uppercase tracking-widest">
        No finals yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between text-xxs text-secondary uppercase tracking-widest">
        <span>{formatDate(current.matchDate)}</span>
        <span>{current.notes ?? 'Final'}</span>
      </div>

      <div className="flex items-center justify-between gap-sm text-sm font-semibold text-primary">
        <span className="flex-1 truncate text-left">
          {current.homeTeam.shortName}
        </span>
        <span className="px-sm py-xxs rounded-md bg-accent/10 text-accent text-lg font-black">
          {current.homeTeam.score} - {current.awayTeam.score}
        </span>
        <span className="flex-1 truncate text-right">
          {current.awayTeam.shortName}
        </span>
      </div>

      <div className="flex justify-center gap-xxs pt-sm">
        {safeResults.map((result, index) => {
          const isActive = index === activeIndex;
          const indicatorStyle = {
            backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
            opacity: isActive ? 1 : 0.6,
          };

          return (
            <button
              key={result.matchId}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show result ${index + 1}`}
              aria-pressed={isActive}
              className="h-2.5 w-2.5 rounded-full transition-all duration-fast"
              style={indicatorStyle}
            />
          );
        })}
      </div>
    </div>
  );
}
