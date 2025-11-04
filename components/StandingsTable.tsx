import Link from 'next/link';
import type { StandingRow } from '@/lib/types';
import { StandingsCard } from '@/components/mobile/StandingsCard';

type StandingsTableProps = {
  rows: StandingRow[];
  highlightTeamId?: string;
  compact?: boolean;
  className?: string;
};

const tableHeaders = [ 'Team', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS' ];

export function StandingsTable({ rows, highlightTeamId, compact = false, className }: StandingsTableProps) {
  // Mobile-First: Show card layout on mobile, table on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return <StandingsCard rows={rows} highlightTeamId={highlightTeamId} className={className} />;
  }

  // Fallback for SSR or desktop/tablet
  if (rows.length === 0) {
    return (
      <div>
        NO DATA
      </div>
    );
  }

  const displayRows = compact ? rows.slice(0, 12) : rows;

  return (
    <div className="standings-table-container">
      <table className="standings-table">
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => {
            const isHighlighted = highlightTeamId === row.teamId;

            return (
              <tr key={row.teamId} data-highlighted={isHighlighted ? 'true' : undefined}>
                <td>
                  <Link href={`/teams/${row.teamId}`}>
                    {row.teamShortName || row.teamName}
                  </Link>
                </td>
                <td>{row.w}</td>
                <td>{row.d}</td>
                <td>{row.l}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td>{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
