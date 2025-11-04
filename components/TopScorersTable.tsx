import type { ScorerRow } from '@/lib/types';
import { TopScorersCard } from '@/components/mobile/TopScorersCard';

type TopScorersTableProps = {
  scorers: ScorerRow[];
  showMatchesColumn?: boolean;
  compact?: boolean;
  className?: string;
};

export function TopScorersTable({
  scorers,
  showMatchesColumn = false,
  compact = false,
  className,
}: TopScorersTableProps) {
  // Mobile-First: Show card layout on mobile, table on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return (
      <TopScorersCard
        scorers={scorers}
        showMatchesColumn={showMatchesColumn}
        compact={compact}
        className={className}
      />
    );
  }

  // Fallback for SSR or desktop/tablet
  if (scorers.length === 0) {
    return (
      <div>
        NO GOALS
      </div>
    );
  }

  const displayRows = compact ? scorers.slice(0, 10) : scorers;

  return (
    <table className="top-scorers-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Player</th>
          <th scope="col">Club</th>
          <th scope="col">Goals</th>
          {showMatchesColumn && <th scope="col">Games</th>}
        </tr>
      </thead>
      <tbody>
        {displayRows.map((scorer, index) => {
          const rank = scorer.rank ?? index + 1;

          return (
            <tr key={scorer.playerId}>
              <td>
                {rank}
              </td>
              <td>{scorer.playerName}</td>
              <td>{scorer.teamShortName}</td>
              <td>{scorer.goals}</td>
              {showMatchesColumn && (
                <td>
                  {scorer.matchesWithGoal}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}