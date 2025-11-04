'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { StandingRow } from '@/lib/types';
import styles from './EnhancedStandingsCard.module.css';

type EnhancedStandingsCardProps = {
  rows: StandingRow[];
  highlightTeamId?: string;
  className?: string;
  maxRows?: number;
  showFullLink?: boolean;
  onExpand?: () => void;
};

export function EnhancedStandingsCard({
  rows,
  highlightTeamId,
  className,
  maxRows = 10,
  showFullLink = false,
  onExpand
}: EnhancedStandingsCardProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const displayRows = rows.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <div className={`${styles.enhancedStandingsCard} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyTitle}>No standings yet</div>
          <div className={styles.emptyDescription}>
            Standings will appear once matches are recorded
          </div>
        </div>
      </div>
    );
  }

  const toggleExpanded = (teamId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const maxPoints = Math.max(...rows.map(row => row.points), 1);

  return (
    <div className={`${styles.enhancedStandingsCard} ${className || ''}`}>
      <div className={styles.standingsList}>
        {displayRows.map((row, index) => {
          const isHighlighted = highlightTeamId === row.teamId;
          const isExpanded = expandedRows.has(row.teamId);
          const rank = index + 1;
          const isLeader = rank === 1;
          const goalDiff = row.gd > 0 ? `+${row.gd}` : row.gd.toString();
          const progressWidth = Math.min(100, Math.max(10, Math.round((row.points / maxPoints) * 100)));

          // Primary metrics to show
          const primaryMetrics = [
            { label: 'Points', value: row.points, highlight: true },
            { label: 'Games', value: row.gp },
            { label: 'Goal Diff', value: goalDiff },
          ];

          // Secondary metrics to show when expanded
          const secondaryMetrics = [
            { label: 'Wins', value: row.w },
            { label: 'Draws', value: row.d },
            { label: 'Losses', value: row.l },
            { label: 'Goals For', value: row.gf },
            { label: 'Goals Against', value: row.ga },
          ];

          return (
            <div
              key={row.teamId}
              className={`${styles.standingsRow} ${
                isHighlighted ? styles.standingsRowHighlighted : ''
              } ${isLeader ? styles.standingsRowLeader : ''}`}
            >
              {/* Progress bar for leader */}
              {isLeader && (
                <div
                  className={styles.progressBar}
                  style={{ width: `${progressWidth}%` }}
                  aria-hidden="true"
                />
              )}

              <div className={styles.standingsRowContent}>
                {/* Left side: Rank and team info */}
                <div className={styles.standingsTeam}>
                  <div className={styles.standingsRank}>
                    <span className={styles.rankNumber}>{rank}</span>
                    {isLeader && <span className={styles.crownIcon}>👑</span>}
                  </div>
                  <div className={styles.standingsTeamInfo}>
                    <Link
                      href={`/teams/${row.teamId}`}
                      className={styles.teamLink}
                    >
                      {row.teamShortName || row.teamName}
                    </Link>
                    <div className={styles.teamMeta}>
                      {row.gp} games played
                    </div>
                  </div>
                </div>

                {/* Right side: Primary metrics */}
                <div className={styles.standingsMetrics}>
                  {primaryMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className={`${styles.metric} ${
                        metric.highlight ? styles.metricHighlight : ''
                      }`}
                    >
                      <div className={styles.metricValue}>{metric.value}</div>
                      <div className={styles.metricLabel}>{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Expand button */}
                <button
                  onClick={() => toggleExpanded(row.teamId)}
                  className={styles.expandButton}
                  aria-label={isExpanded ? 'Show less details' : 'Show more details'}
                  aria-expanded={isExpanded}
                >
                  <span
                    className={`${styles.expandIcon} ${
                      isExpanded ? styles.expandIconExpanded : ''
                    }`}
                  >
                    ⌄
                  </span>
                </button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className={styles.expandedContent}>
                  <div className={styles.expandedMetrics}>
                    {secondaryMetrics.map((metric) => (
                      <div key={metric.label} className={styles.expandedMetric}>
                        <div className={styles.expandedMetricValue}>{metric.value}</div>
                        <div className={styles.expandedMetricLabel}>{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.recordDisplay}>
                    <span className={styles.recordLabel}>Record:</span>
                    <span className={styles.recordValue}>
                      {row.w}-{row.d}-{row.l}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show full table link */}
      {showFullLink && rows.length > maxRows && (
        <div className={styles.fullTableLink}>
          <button
            onClick={onExpand}
            className={styles.viewFullButton}
          >
            View full standings ({rows.length} teams)
            <span className={styles.buttonArrow}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}