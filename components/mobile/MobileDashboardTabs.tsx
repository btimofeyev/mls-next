'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Surface } from '@/components/ui/Surface';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DivisionStatsPanel } from '@/components/DivisionStatsPanel';
import { EnhancedStandingsCard } from '@/components/mobile/EnhancedStandingsCard';
import { EnhancedTopScorersCard } from '@/components/mobile/EnhancedTopScorersCard';
import { ResultSpotlight } from '@/components/dashboard/ResultSpotlight';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import styles from './MobileDashboardTabs.module.css';

interface MobileDashboardTabsProps {
  standings: any[];
  scorers: any[];
  latestResults: any[];
  divisionStats: any;
  divisionName: string;
}

type TabType = 'standings' | 'results' | 'scorers' | 'stats';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'standings', label: 'Standings', icon: '📊' },
  { id: 'results', label: 'Results', icon: '⚽' },
  { id: 'scorers', label: 'Top Scorers', icon: '🥅' },
  { id: 'stats', label: 'Stats', icon: '📈' },
];

export function MobileDashboardTabs({
  standings,
  scorers,
  latestResults,
  divisionStats,
  divisionName,
}: MobileDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('standings');

  const standingsSnapshot = standings.slice(0, 10);
  const recentResultsSnapshot = latestResults.slice(0, 6);
  const topScorersSnapshot = scorers.slice(0, 10);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'standings':
        return (
          <div className={styles.mobileTabContent}>
            <div className={styles.mobileTabHeader}>
              <SectionHeading
                title={`${divisionName} Standings`}
                description="Top 10 teams"
              />
            </div>
            <div className={styles.mobileTabBody}>
              <EnhancedStandingsCard
                rows={standingsSnapshot}
                showFullLink={true}
                onExpand={() => {
                  // Navigate to full standings page
                  window.location.href = `/standings/${DEFAULT_DIVISION_ID}`;
                }}
              />
            </div>
          </div>
        );

      case 'results':
        return (
          <div className={styles.mobileTabContent}>
            <div className={styles.mobileTabHeader}>
              <SectionHeading
                title="Recent Results"
                description="Latest match results"
              />
            </div>
            <div className={styles.mobileTabBody}>
              <div className={styles.mobileResultsContainer}>
                  <ResultSpotlight results={recentResultsSnapshot} />
                </div>
            </div>
          </div>
        );

      case 'scorers':
        return (
          <div className={styles.mobileTabContent}>
            <div className={styles.mobileTabHeader}>
              <SectionHeading
                title="Golden Boot Race"
                description="Top goal scorers"
              />
            </div>
            <div className={styles.mobileTabBody}>
              <EnhancedTopScorersCard
                scorers={topScorersSnapshot}
                compact={true}
                showFullLink={true}
                onExpand={() => {
                  // Navigate to full leaderboard page
                  window.location.href = `/leaderboard/${DEFAULT_DIVISION_ID}`;
                }}
              />
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className={styles.mobileTabContent}>
            <div className={styles.mobileTabHeader}>
              <SectionHeading
                title="Division Statistics"
                description="League analytics and insights"
              />
            </div>
            <div className={styles.mobileTabBody}>
              <DivisionStatsPanel
                stats={divisionStats}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.mobileDashboardTabs} {...handlers}>
      {/* Tab Navigation */}
      <div className={styles.mobileTabNav}>
        <div className={styles.mobileTabNavInner}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.mobileTabButton} ${
                activeTab === tab.id ? styles.mobileTabButtonActive : ''
              }`}
              aria-label={`View ${tab.label}`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className={styles.mobileTabIcon} aria-hidden="true">
                {tab.icon}
              </span>
              <span className={styles.mobileTabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
        <div
          className={styles.mobileTabIndicator}
          style={{
            transform: `translateX(${TABS.findIndex(tab => tab.id === activeTab) * 100}%)`,
          }}
        />
      </div>

      {/* Tab Content */}
      <Surface variant="solid" padding="lg" rounded="xl" className={styles.mobileTabSurface}>
        <div className={styles.mobileTabViewport}>
          {renderTabContent()}
        </div>
      </Surface>

      {/* Swipe Hint */}
      <div className={styles.mobileSwipeHint} aria-hidden="true">
        <span className={styles.swipeHintText}>Swipe to navigate</span>
        <div className={styles.swipeHintDots}>
          {TABS.map((tab, index) => (
            <div
              key={tab.id}
              className={`${styles.swipeDot} ${
                activeTab === tab.id ? styles.swipeDotActive : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}