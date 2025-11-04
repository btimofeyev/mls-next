'use client';

import Link from 'next/link';
import type { StandingRow } from '@/lib/types';

type StandingsCardProps = {
  rows: StandingRow[];
  highlightTeamId?: string;
  className?: string;
};

export function StandingsCard({ rows, highlightTeamId, className }: StandingsCardProps) {
  if (rows.length === 0) {
    return <div>NO DATA</div>;
  }

  return (
    <div className={className}>
      {rows.map((row, index) => {
        const isHighlighted = highlightTeamId === row.teamId;
        const metrics = [
          { label: 'W', value: row.w },
          { label: 'D', value: row.d },
          { label: 'L', value: row.l },
          { label: 'GF', value: row.gf },
          { label: 'GA', value: row.ga },
          { label: 'GD', value: row.gd > 0 ? `+${row.gd}` : row.gd },
          { label: 'PTS', value: row.points },
        ];

        return (
          <div key={row.teamId} data-highlighted={isHighlighted ? 'true' : undefined}>
            <div>
              <div>{index + 1}</div>
              <Link href={`/teams/${row.teamId}`}>
                {row.teamShortName || row.teamName}
              </Link>
            </div>
            <div>
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <div>{metric.value}</div>
                  <div>{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
