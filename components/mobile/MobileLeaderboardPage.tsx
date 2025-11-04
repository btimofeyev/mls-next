'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ScorerRow } from '@/lib/types';
import { Surface } from '@/components/ui/Surface';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EnhancedTopScorersCard } from './EnhancedTopScorersCard';
import styles from './MobileLeaderboardPage.module.css';

type MobileLeaderboardPageProps = {
  divisionName: string;
  divisionId: string;
  scorers: ScorerRow[];
  totalGoalsTracked: number;
  clubsOnTheBoard: number;
};

export function MobileLeaderboardPage({
  divisionName,
  divisionId,
  scorers,
  totalGoalsTracked,
  clubsOnTheBoard
}: MobileLeaderboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter scorers based on search
  const filteredScorers = useMemo(() => {
    if (!searchQuery.trim()) return scorers;

    return scorers.filter(scorer =>
      scorer.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scorer.teamShortName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scorers, searchQuery]);

  // Always show top 10, or search results if searching
  const displayScorers = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredScorers;
    }
    return scorers.slice(0, 10);
  }, [scorers, searchQuery, filteredScorers]);

  const hasSearchResults = searchQuery && filteredScorers.length > 0;
  const noSearchResults = searchQuery && filteredScorers.length === 0;

  return (
    <div className={styles.mobileLeaderboardPage}>
      {/* Header */}
      <section className={styles.headerSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerEyebrow}>
              Golden Boot Radar
            </div>
            <h1 className={styles.headerTitle}>
              {divisionName}
            </h1>
            <Link
              href={`/standings/${divisionId}`}
              className={styles.headerAction}
            >
              View standings →
            </Link>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalGoalsTracked}</span>
              <span className={styles.statLabel}>Goals</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{clubsOnTheBoard}</span>
              <span className={styles.statLabel}>Clubs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{scorers.length}</span>
              <span className={styles.statLabel}>Scorers</span>
            </div>
          </div>
        </Surface>
      </section>

      {/* Search */}
      <section className={styles.searchSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.searchCard}>
          <div className={styles.searchHeader}>
            <SectionHeading
              title="Find Players"
              description="Search by name or team"
            />
          </div>

          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players or teams..."
              className={styles.searchInput}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Summary */}
          {hasSearchResults && (
            <div className={styles.searchResults}>
              <span className={styles.searchResultsText}>
                Found {filteredScorers.length} player{filteredScorers.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </Surface>
      </section>

    
      {/* Results */}
      <section className={styles.resultsSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {searchQuery ? 'Search Results' : 'Top 10 Scorers'}
            </h2>
            {hasSearchResults && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.backToAllButton}
              >
                ← Back to Top 10
              </button>
            )}
          </div>

          <div className={styles.resultsViewport}>
            {displayScorers.length > 0 ? (
              <EnhancedTopScorersCard
                scorers={displayScorers}
                showMatchesColumn={false}
                compact={true}
                showFullLink={false}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {searchQuery ? '🔍' : '🥅'}
                </div>
                <div className={styles.emptyTitle}>
                  {searchQuery ? 'No players found' : 'No scorers yet'}
                </div>
                <div className={styles.emptyDescription}>
                  {searchQuery
                    ? `No players match "${searchQuery}"`
                    : 'Goal statistics will appear once matches are played'
                  }
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={styles.emptyAction}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </Surface>
      </section>

      {/* Info */}
      <section className={styles.infoSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Leaderboard Rules</h3>
          <ul className={styles.infoList}>
            <li>Only credited goals count — own goals are ignored</li>
            <li>Hat tricks and braces get automatic spotlight features</li>
            <li>Players must appear in at least one match to be listed</li>
          </ul>
        </Surface>
      </section>
    </div>
  );
}