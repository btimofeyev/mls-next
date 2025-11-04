'use client';

import Link from 'next/link';
import type { ScorerRow } from '@/lib/types';

type TopScorersCardProps = {
  scorers: ScorerRow[];
  showMatchesColumn?: boolean;
  compact?: boolean;
  className?: string;
};

export function TopScorersCard({
  scorers,
  showMatchesColumn = false,
  compact = false,
  className,
}: TopScorersCardProps) {
  if (scorers.length === 0) {
    return <div>NO GOALS</div>;
  }

  const displayRows = compact ? scorers.slice(0, 10) : scorers;

  return (
    <div>
      {displayRows.map((scorer, index) => {
        const rank = scorer.rank ?? index + 1;
        const isTopThree = rank <= 3;

        return (
          <div key={scorer.playerId}>
            <div>
              <div>
                <div>
                  <div>{rank}</div>
                  <div>
                    <div>{scorer.playerName}</div>
                    <Link href={`/teams/${scorer.teamId}`}>
                      {scorer.teamShortName}
                    </Link>
                  </div>
                </div>
                <div>
                  <div>
                    <div>{scorer.goals}</div>
                    <div>{scorer.goals === 1 ? 'Goal' : 'Goals'}</div>
                  </div>
                  {showMatchesColumn && (
                    <div>
                      <div>{scorer.matchesWithGoal}</div>
                      <div>Games</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}