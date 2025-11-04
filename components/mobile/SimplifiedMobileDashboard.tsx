'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Link from 'next/link';
import { Surface } from '@/components/ui/Surface';
import { EnhancedStandingsCard } from './EnhancedStandingsCard';
import { EnhancedTopScorersCard } from './EnhancedTopScorersCard';
import { MobileResultsList } from './MobileResultsList';
import styles from './SimplifiedMobileDashboard.module.css';

type SimplifiedMobileDashboardProps = {
  divisionName: string;
  divisionId: string;
  standings: any[];
  scorers: any[];
  latestResults: any[];
  headline: {
    title: string;
    body?: string;
    date: string;
  } | null;
};

type TabType = 'standings' | 'scorers' | 'results' | 'headlines';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'standings', label: 'Standings', icon: '📊' },
  { id: 'scorers', label: 'Top Scorers', icon: '🥅' },
  { id: 'results', label: 'Results', icon: '⚽' },
  { id: 'headlines', label: 'News', icon: '📰' },
];

export function SimplifiedMobileDashboard({
  divisionName,
  divisionId,
  standings,
  scorers,
  latestResults,
  headline
}: SimplifiedMobileDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('standings');

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % TABS.length;
      setActiveTab(TABS[nextIndex].id);
    },
    onSwipedRight: () => {
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      const prevIndex = currentIndex === 0 ? TABS.length - 1 : currentIndex - 1;
      setActiveTab(TABS[prevIndex].id);
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50,
  });

  const standingsSnapshot = standings.slice(0, 5);
  const topScorersSnapshot = scorers.slice(0, 5);
  const recentResultsSnapshot = latestResults.slice(0, 5);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'standings':
        return (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>Top 5 Standings</h3>
            </div>
            <div className={styles.tabBody}>
              {standingsSnapshot.length > 0 ? (
                <EnhancedStandingsCard rows={standingsSnapshot} />
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <div className={styles.emptyTitle}>No standings yet</div>
                  <div className={styles.emptyDescription}>
                    Standings will appear once matches are recorded
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'scorers':
        return (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>Top 5 Scorers</h3>
            </div>
            <div className={styles.tabBody}>
              <div className={styles.scorersContainer}>
                {topScorersSnapshot.length > 0 ? (
                  <>
                    <EnhancedTopScorersCard scorers={topScorersSnapshot} compact={true} />
                    {scorers.length > 5 && (
                      <div className={styles.viewFullLeaderboardLink}>
                        <Link
                          href={`/leaderboard/${divisionId}`}
                          className={styles.viewFullLeaderboardButton}
                        >
                          View full leaderboard ({scorers.length} players)
                          <span className={styles.buttonArrow}>→</span>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🥅</div>
                    <div className={styles.emptyTitle}>No scorers yet</div>
                    <div className={styles.emptyDescription}>
                      Goal statistics will appear once matches are played
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>Recent Results</h3>
            </div>
            <div className={styles.tabBody}>
              <MobileResultsList results={recentResultsSnapshot} />
            </div>
          </div>
        );

      case 'headlines':
        return (
          <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>Latest News</h3>
            </div>
            <div className={styles.tabBody}>
              {headline ? (
                <div className={styles.headlineContentCard}>
                  <div className={styles.headlineDate}>{headline.date}</div>
                  <div className={styles.headlineTitle}>{headline.title}</div>
                  {headline.body && (
                    <div className={styles.headlineBody}>{headline.body}</div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📰</div>
                  <div className={styles.emptyTitle}>No news yet</div>
                  <div className={styles.emptyDescription}>
                    Latest news and updates will appear here
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.simplifiedMobileDashboard}>
      {/* Header */}
      <section className={styles.headerSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.headerCard}>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>
              MLS NEXT Pulse
            </h1>
            <div className={styles.divisionIndicator}>
              <span className={styles.divisionLabel}>Division:</span>
              <span className={styles.divisionName}>{divisionName}</span>
            </div>
          </div>
        </Surface>
      </section>

      {/* Tab Navigation */}
      <section className={styles.tabSection}>
        <Surface variant="solid" padding="md" rounded="xl" className={styles.tabCard} {...handlers}>
          <div className={styles.tabNavigation}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.tabButtonActive : ''
                }`}
                aria-label={`View ${tab.label}`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  {tab.icon}
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>
          <div
            className={styles.tabIndicator}
            style={{
              transform: `translateX(${TABS.findIndex(tab => tab.id === activeTab) * 100}%)`,
            }}
          />
        </Surface>
      </section>

      {/* Tab Content */}
      <section className={styles.contentSection}>
        <Surface variant="solid" padding="lg" rounded="xl" className={styles.contentCard}>
          <div className={styles.contentViewport}>
            {renderTabContent()}
          </div>
        </Surface>
      </section>

  
      </div>
  );
}