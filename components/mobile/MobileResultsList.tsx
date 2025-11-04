'use client';

import type { LatestResult } from '@/lib/types';

type MobileResultsListProps = {
  results: LatestResult[];
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

export function MobileResultsList({ results }: MobileResultsListProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center text-sm text-secondary py-8">
        No recent results available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.matchId}
          className="bg-surface rounded-xl p-4 border border-border/30 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-secondary uppercase tracking-widest mb-3">
            <span>{formatDate(result.matchDate)}</span>
            <span>{result.notes ?? 'Final'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-left pr-3">
              <div className="font-semibold text-base text-primary truncate">
                {result.homeTeam.shortName}
              </div>
            </div>

            <div className="flex items-center px-4 py-2 bg-accent/10 rounded-lg">
              <span className="text-accent text-xl font-black">
                {result.homeTeam.score} - {result.awayTeam.score}
              </span>
            </div>

            <div className="flex-1 text-right pl-3">
              <div className="font-semibold text-base text-primary truncate">
                {result.awayTeam.shortName}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}