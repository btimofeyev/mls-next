'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ScorerRow } from '@/lib/types';
import styles from './EnhancedTopScorersCard.module.css';

type EnhancedTopScorersCardProps = {
  scorers: ScorerRow[];
  showMatchesColumn?: boolean;
  compact?: boolean;
  className?: string;
  maxRows?: number;
  showFullLink?: boolean;
  onExpand?: () => void;
};

export function EnhancedTopScorersCard({
  scorers,
  showMatchesColumn = false,
  compact = false,
  className,
  maxRows = 10,
  showFullLink = false,
  onExpand
}: EnhancedTopScorersCardProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const displayRows = compact ? scorers.slice(0, maxRows) : scorers;

  if (scorers.length === 0) {
    return (
      <div className={`${styles.enhancedTopScorersCard} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🥅</div>
          <div className={styles.emptyTitle}>No scorers yet</div>
          <div className={styles.emptyDescription}>
            Goal statistics will appear once matches are played
          </div>
        </div>
      </div>
    );
  }

  const toggleExpanded = (playerId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const maxGoals = Math.max(...scorers.map(scorer => scorer.goals), 1);

  return (
    <div className={`${styles.enhancedTopScorersCard} ${className || ''}`}>
      <div className={styles.scorersList}>
        {displayRows.map((scorer, index) => {
          const rank = scorer.rank ?? index + 1;
          const isExpanded = expandedRows.has(scorer.playerId);
          const isTopThree = rank <= 3;
          const progressWidth = Math.min(100, Math.max(10, Math.round((scorer.goals / maxGoals) * 100)));

          // Rank badge styling
          const getRankBadge = (rank: number) => {
            switch (rank) {
              case 1:
                return { icon: '🥇', color: 'gold' };
              case 2:
                return { icon: '🥈', color: 'silver' };
              case 3:
                return { icon: '🥉', color: 'bronze' };
              default:
                return { icon: rank.toString(), color: 'default' };
            }
          };

          const rankBadge = getRankBadge(rank);

          return (
            <div
              key={scorer.playerId}
              className={`${styles.scorerRow} ${
                isTopThree ? styles.scorerRowTopThree : ''
              }`}
            >
              {/* Progress bar */}
              <div
                className={styles.progressBar}
                style={{ width: `${progressWidth}%` }}
                aria-hidden="true"
              />

              <div className={styles.scorerRowContent}>
                {/* Rank and player info */}
                <div className={styles.scorerInfo}>
                  <div className={`${styles.rankBadge} ${styles[`rankBadge${rankBadge.color}`]}`}>
                    <span className={styles.rankIcon}>{rankBadge.icon}</span>
                  </div>
                  <div className={styles.playerDetails}>
                    <div className={styles.playerName}>{scorer.playerName}</div>
                    <Link
                      href={`/teams/${scorer.teamId}`}
                      className={styles.teamLink}
                    >
                      {scorer.teamShortName}
                    </Link>
                  </div>
                </div>

                {/* Goals count */}
                <div className={styles.goalsSection}>
                  <div className={styles.goalsCount}>
                    <span className={styles.goalsNumber}>{scorer.goals}</span>
                    <span className={styles.goalsLabel}>
                      {scorer.goals === 1 ? 'Goal' : 'Goals'}
                    </span>
                  </div>
                  {showMatchesColumn && (
                    <div className={styles.matchesInfo}>
                      <span className={styles.matchesNumber}>{scorer.matchesWithGoal}</span>
                      <span className={styles.matchesLabel}>Games</span>
                    </div>
                  )}
                </div>

                {/* Expand button */}
                <button
                  onClick={() => toggleExpanded(scorer.playerId)}
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
                  <div className={styles.expandedStats}>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Goals per game</div>
                      <div className={styles.statValue}>
                        {scorer.matchesWithGoal > 0
                          ? (scorer.goals / scorer.matchesWithGoal).toFixed(2)
                          : '0.00'
                        }
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Scoring frequency</div>
                      <div className={styles.statValue}>
                        {scorer.matchesWithGoal > 0
                          ? `1 in ${(scorer.matchesWithGoal / scorer.goals).toFixed(1)} games`
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>

                  <div className={styles.achievementBadges}>
                    {isTopThree && (
                      <div className={styles.achievementBadge}>
                        <span className={styles.achievementIcon}>⭐</span>
                        <span className={styles.achievementText}>
                          Top {rank === 1 ? 'Scorer' : '3 Scorer'}
                        </span>
                      </div>
                    )}
                    {scorer.goals >= 10 && (
                      <div className={styles.achievementBadge}>
                        <span className={styles.achievementIcon}>🔥</span>
                        <span className={styles.achievementText}>
                          Double digits
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show full leaderboard link */}
      {showFullLink && scorers.length > maxRows && (
        <div className={styles.fullLeaderboardLink}>
          <button
            onClick={onExpand}
            className={styles.viewFullButton}
          >
            View full leaderboard ({scorers.length} players)
            <span className={styles.buttonArrow}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}