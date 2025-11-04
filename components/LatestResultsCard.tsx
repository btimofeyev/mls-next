'use client';

import { useEffect, useState, type HTMLAttributes } from 'react';
import useSWR from 'swr';
import { format, parseISO } from 'date-fns';
import { Surface } from '@/components/ui/Surface';
import type { LatestResult } from '@/lib/types';

interface LatestResultsCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'results'> {
  results: LatestResult[];
  divisionId: string;
  compact?: boolean;
  rotating?: boolean;
  }

function formatDate(dateString: string, compact: boolean) {
  try {
    return format(parseISO(dateString), compact ? 'MMM d' : 'MMMM d, yyyy');
  } catch {
    return dateString;
  }
}

function PagerDots({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <div>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Show match ${index + 1}`}
        />
      ))}
    </div>
  );
}

export function LatestResultsCard({
  results,
  divisionId,
  compact = false,
  rotating = false,
    ...rest
}: LatestResultsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const fetchLimit = 12;

  const { data: liveResults = results, mutate } = useSWR<LatestResult[]>(
    [ 'latest-results', divisionId, fetchLimit ],
    async ([ , division, limit ]) => {
      const response = await fetch(`/api/matches?divisionId=${division}&limit=${limit}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load latest results (${response.status})`);
      }
      const payload = await response.json().catch(() => null);
      return (payload?.data ?? []) as LatestResult[];
    },
    {
      fallbackData: results,
      refreshInterval: 60000,
    },
  );

  const baseResults = liveResults ?? results;
  const resultsLength = baseResults.length;

  useEffect(() => {
    if (rotating && resultsLength > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % resultsLength);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [rotating, resultsLength, isPaused]);

  useEffect(() => {
    if (currentIndex >= resultsLength && resultsLength > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, resultsLength]);

  useEffect(() => {
    const handleExternalRefresh = () => {
      mutate();
    };

    window.addEventListener('mls-next:pulled-to-refresh', handleExternalRefresh);
    return () => {
      window.removeEventListener('mls-next:pulled-to-refresh', handleExternalRefresh);
    };
  }, [mutate]);

  const displayResults = rotating && resultsLength > 0 ? [ baseResults[currentIndex] ] : baseResults;

  if (resultsLength === 0) {
    return (
      <Surface
        padding="md"
        {...rest}
      >
        NO MATCHES
      </Surface>
    );
  }

  const handleSelectIndex = (index: number) => {
    if (resultsLength === 0) return;
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (compact) {
    const compactResults = rotating && resultsLength > 0 ? [ baseResults[currentIndex] ] : baseResults.slice(0, 4);

    return (
      <Surface
        padding="md"
        {...rest}
      >
        <header>
          <div>
            <span>
              Finals
            </span>
            <PagerDots total={resultsLength} current={currentIndex} onSelect={handleSelectIndex} />
          </div>
          <p>
            Swipe for more finals pulled from the latest fixtures.
          </p>
        </header>

        <ul>
          {compactResults.map((result) => {
            const scorersSummary =
              result.notableScorers.length > 0
                ? result.notableScorers.map((scorer) => `${scorer.playerName} (${scorer.goals})`).join(', ')
                : null;

            return (
              <li
                key={result.matchId}
              >
                <div>
                  <span>{formatDate(result.matchDate, true)}</span>
                  {result.notes && <span>{result.notes}</span>}
                </div>

                <div>
                  <span>{result.homeTeam.shortName}</span>
                  <span>
                    <span>{result.homeTeam.score}</span>
                    <span>—</span>
                    <span>{result.awayTeam.score}</span>
                  </span>
                  <span>{result.awayTeam.shortName}</span>
                </div>

                {scorersSummary && (
                  <p>
                    {scorersSummary}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Surface>
    );
  }

  return (
    <Surface
      padding="md"
      {...rest}
    >
      <div>
        <div>
          <span>
            Match center
          </span>
          <p>Tap a final to expand player impact.</p>
        </div>
        <PagerDots total={resultsLength} current={currentIndex} onSelect={handleSelectIndex} />
      </div>

      <div>
        {displayResults.map((result) => {
          const totalGoals = result.notableScorers.reduce((total, scorer) => total + scorer.goals, 0);
          const isExpanded = expandedMatchId === result.matchId;
          const hasScorers = result.notableScorers.length > 0;

          const handleToggle = () => {
            setExpandedMatchId(isExpanded ? null : result.matchId);
            if (rotating) {
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 10000);
            }
          };

          return (
            <button
              key={result.matchId}
              type="button"
              onClick={handleToggle}
              aria-expanded={isExpanded}
            >
              <div>
                <span>{formatDate(result.matchDate, false)}</span>
                {result.notes && <span>{result.notes}</span>}
              </div>

              <div>
                <span>{result.homeTeam.shortName}</span>
                <div>
                  <span>{result.homeTeam.score}</span>
                  <span>—</span>
                  <span>{result.awayTeam.score}</span>
                </div>
                <span>{result.awayTeam.shortName}</span>
              </div>

              <div>
                <span>{hasScorers ? `${totalGoals} goals` : 'NO DATA'}</span>
                <span>
                  {isExpanded ? 'LESS' : 'MORE'}
                  <span aria-hidden>
                    ⌄
                  </span>
                </span>
              </div>

              <div
                aria-hidden={!isExpanded}
              >
                {hasScorers ? (
                  result.notableScorers.map((scorer) => (
                    <div key={scorer.playerId}>
                      <span>{scorer.playerName}</span>
                      <span>
                        {scorer.goals}g
                      </span>
                    </div>
                  ))
                ) : (
                  <p>NO GOALS</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Surface>
  );
}
