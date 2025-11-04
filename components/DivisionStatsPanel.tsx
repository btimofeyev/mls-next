'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { DivisionSnapshotStats, TeamStatHighlight } from '@/lib/types';
import { Surface } from '@/components/ui/Surface';

type DivisionStatsPanelProps = {
  stats: DivisionSnapshotStats;
  className?: string;
  style?: CSSProperties;
  intervalMs?: number;
};

type SectionConfig = {
  key: 'topAttacks' | 'topDefenses' | 'cleanSheetLeaders';
  title: string;
};

const sections: SectionConfig[] = [
  {
    key: 'topAttacks',
    title: 'Attack pace',
  },
  {
    key: 'topDefenses',
    title: 'Defensive wall',
  },
  {
    key: 'cleanSheetLeaders',
    title: 'Clean sheets',
  },
];

function StatList({ highlights }: { highlights: TeamStatHighlight[] }) {
  if (highlights.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-md bg-surface-elevated text-xxs text-secondary uppercase tracking-widest">
        No data yet
      </div>
    );
  }

  return (
    <ul className="division-stats-list">
      {highlights.map((highlight, index) => (
        <li
          key={highlight.teamId}
          className="division-stats-row"
        >
          <div className="division-stats-rank">
            <span>
              {index + 1}
            </span>
          </div>
          <div className="division-stats-team">
            <span className="division-stats-team-name">
              {highlight.teamShortName}
            </span>
            <span className="division-stats-team-meta">
              {highlight.teamName}
            </span>
          </div>
          <span className="division-stats-value">
            {highlight.formattedValue ?? highlight.value.toString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DivisionStatsPanel({
  stats,
  className,
  style,
  intervalMs = 7000,
}: DivisionStatsPanelProps) {
  const rotation = useMemo(() => {
    const withHighlights = sections.map((section) => ({
      ...section,
      highlights: stats[section.key] ?? [],
    }));

    const populated = withHighlights.filter((section) => section.highlights.length > 0);
    return populated.length > 0 ? populated : withHighlights;
  }, [stats]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [rotation.length]);

  useEffect(() => {
    if (rotation.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % rotation.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [rotation.length, intervalMs]);

  const activeSection = rotation[activeIndex] ?? rotation[0];
  const highlights = activeSection?.highlights.slice(0, 3) ?? [];
  const remainder = (activeSection?.highlights.length ?? 0) - highlights.length;

  const surfaceClassName = [ 'flex flex-col gap-md', className ].filter(Boolean).join(' ');

  return (
    <Surface padding="md" variant="muted" className={surfaceClassName} style={style}>
      <header className="division-stats-header">
        <div className="division-stats-heading">
          <span className="division-stats-eyebrow">
            Division pulse
          </span>
          <h3 className="division-stats-title">
            {activeSection?.title ?? 'Snapshot'}
          </h3>
        </div>

        <nav className="division-stats-toggle" aria-label="Division stats categories">
          {rotation.map((section, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={section.key}
                type="button"
                className={`division-stats-toggle-btn${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
              >
                {section.title}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="flex-1 min-h-0 flex flex-col gap-md">
        <StatList highlights={highlights} />
        {remainder > 0 && (
          <span className="division-stats-remainder">
            +{remainder} more clubs ranked
          </span>
        )}
      </div>
    </Surface>
  );
}
