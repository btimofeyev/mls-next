import Link from 'next/link';
import { Surface } from '@/components/ui/Surface';
import { DivisionStatsPanel } from '@/components/DivisionStatsPanel';
import { ResultSpotlight } from '@/components/dashboard/ResultSpotlight';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { getDivisionById } from '@/lib/getDivision';
import { getDivisionStats } from '@/lib/getDivisionStats';
import { getHeadlinesForDivision } from '@/lib/getHeadlines';
import { getLatestResults } from '@/lib/getLatestResults';
import { getStandings } from '@/lib/getStandings';
import { getTopScorers } from '@/lib/getTopScorers';

export const revalidate = 30;

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function HomePage() {
  const divisionId = DEFAULT_DIVISION_ID;

  const [division, standings, scorers, latestResults, headlines, divisionStats] = await Promise.all([
    getDivisionById(divisionId),
    getStandings(divisionId),
    getTopScorers(divisionId),
    getLatestResults(divisionId, 12),
    getHeadlinesForDivision(divisionId, 6),
    getDivisionStats(divisionId),
  ]);

  const divisionName = division?.name ?? 'Division';

  const leaderRow = standings[0] ?? null;
  const secondPlace = standings[1] ?? null;
  const standingsSnapshot = standings.slice(0, 10);
  const recentResultsSnapshot = latestResults.slice(0, 6);
  const topScorersSnapshot = scorers.slice(0, 5);
  const headlineSnapshot = headlines.slice(0, 4);

  const topScorer = topScorersSnapshot[0] ?? null;

  const pointsGapToSecond = leaderRow && secondPlace ? leaderRow.points - secondPlace.points : null;
  const avgMatchesPlayed = standingsSnapshot.length > 0
    ? standingsSnapshot.reduce((total, row) => total + row.gp, 0) / standingsSnapshot.length
    : 0;
  const leaderWinRate = leaderRow && leaderRow.gp > 0
    ? Math.round((leaderRow.w / leaderRow.gp) * 100)
    : null;

  const maxPoints = standingsSnapshot.reduce((max, row) => Math.max(max, row.points), 0) || 1;
  const topScorerGoals = topScorersSnapshot.reduce((max, scorer) => Math.max(max, scorer.goals), 0) || 1;

  const insightMetrics = [
    {
      id: 'leader-pace',
      label: 'Leader win rate',
      value: leaderWinRate !== null ? `${leaderWinRate}%` : '—',
      detail: leaderRow ? `${leaderRow.w}-${leaderRow.d}-${leaderRow.l} record` : 'No matches yet',
    },
    {
      id: 'title-gap',
      label: 'Title gap',
      value: pointsGapToSecond !== null ? `${pointsGapToSecond} pts` : '—',
      detail: secondPlace ? `vs ${secondPlace.teamShortName || secondPlace.teamName}` : 'Awaiting challengers',
    },
    {
      id: 'avg-goals',
      label: 'Avg goals',
      value: divisionStats.leagueAvgGoalsPerGame.toFixed(2),
      detail: 'per club per game',
    },
    {
      id: 'top-scorer',
      label: 'Golden boot leader',
      value: topScorer ? topScorer.playerName : '—',
      detail: topScorer ? `${topScorer.teamShortName} • ${topScorer.goals} goals` : 'No scorers yet',
    },
  ];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="dashboard-header">
          <Surface
            variant="solid"
            padding="lg"
            rounded="2xl"
            className="dashboard-header-card"
          >
            <div className="dashboard-header-content">
              <div className="dashboard-header-main">
                <h1 className="dashboard-header-title">
                  {divisionName}
                </h1>
                {headlineSnapshot.length > 0 && (
                  <div className="dashboard-headline">
                    <div className="dashboard-headline-meta">
                      <span>
                        {headlineSnapshot[0].created_at
                          ? formatDate(headlineSnapshot[0].created_at, { month: 'short', day: 'numeric' })
                          : 'Now'}
                      </span>
                    </div>
                    <div className="dashboard-headline-title">
                      {headlineSnapshot[0].title}
                    </div>
                    {headlineSnapshot[0].body ? (
                      <div className="dashboard-headline-body">
                        {headlineSnapshot[0].body}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </Surface>
        </section>

        <section className="dashboard-panels">
          <Surface variant="solid" padding="xl" rounded="2xl" className="dashboard-card">
            <header className="panel-header">
              <div>
                <span className="panel-label">Standings radar</span>
                <div className="panel-subtitle">
                  {standingsSnapshot.length} clubs • avg {avgMatchesPlayed.toFixed(1)} matches played
                </div>
              </div>
              <Link
                href={`/standings/${divisionId}`}
                className="panel-link"
              >
                View full table
              </Link>
            </header>

            {standingsSnapshot.length > 0 ? (
              <ul className="standings-list">
                {standingsSnapshot.map((row, index) => {
                const goalDiff = row.gd > 0 ? `+${row.gd}` : row.gd.toString();
                const progressWidth = Math.min(100, Math.max(10, Math.round((row.points / maxPoints) * 100)));
                const isLeader = leaderRow?.teamId === row.teamId;
                const showProgress = isLeader;
                return (
                  <li
                    key={row.teamId}
                    className={`standings-row${isLeader ? ' standings-row-leader' : ''}`}
                    >
                      {showProgress ? (
                        <span
                          className="standings-progress"
                          style={{ width: `${progressWidth}%` }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="standings-row-content">
                        <div className="standings-rank">
                          <span>{index + 1}</span>
                        </div>
                        <div className="standings-team">
                        <span className="standings-team-name">
                          {row.teamShortName || row.teamName}
                        </span>
                        <span className="standings-team-meta">
                          {row.gp} GP
                        </span>
                      </div>
                      <div className="standings-metrics">
                        <div className="standings-metric-group">
                          <span className="standings-metric-label">Record</span>
                          <span className="standings-metric-value">
                            {row.w}-{row.d}-{row.l}
                          </span>
                        </div>
                        <div className="standings-metric-group">
                          <span className="standings-metric-label">GF / GA</span>
                          <span className="standings-metric-value">
                            {row.gf} / {row.ga}
                          </span>
                        </div>
                        <div className="standings-metric-group standings-metric-highlight">
                          <span className="standings-metric-label">GD</span>
                          <span className="standings-metric-value">
                            {goalDiff}
                          </span>
                        </div>
                        <div className="standings-metric-group standings-metric-points">
                          <span className="standings-metric-label">PTS</span>
                          <span className="standings-metric-value">
                            {row.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
                })}
              </ul>
            ) : (
              <div className="panel-empty">
                Standings will populate once matches are recorded.
              </div>
            )}
          </Surface>

          <div className="dashboard-panels-secondary">
            <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card dashboard-card--compact">
              <header className="panel-header">
                <div>
                  <span className="panel-label">Recent results</span>
                  <div className="panel-subtitle">
                    Final scores from the last fixtures
                  </div>
                </div>
                <div className="panel-status panel-status-muted">
                  <span className="panel-status-dot" aria-hidden="true" />
                  <span>Finals</span>
                </div>
              </header>

              <ResultSpotlight results={recentResultsSnapshot} />
            </Surface>
            
            <DivisionStatsPanel
              stats={divisionStats}
              className="dashboard-card division-stats-card"
            />

            <Surface variant="solid" padding="xl" rounded="2xl" className="dashboard-card dashboard-card--grow">
              <header className="panel-header">
                <div>
                  <span className="panel-label">Golden boot</span>
                  <div className="panel-subtitle">
                    Top finishers at a glance
                  </div>
                </div>
                <Link
                  href={`/leaderboard/${divisionId}`}
                  className="panel-link"
                >
                  View all
                </Link>
              </header>

              {topScorersSnapshot.length > 0 ? (
                <ul className="leader-list">
                  {topScorersSnapshot.map((scorer, index) => {
                    const relativeWidth = Math.round((scorer.goals / topScorerGoals) * 100) || 0;
                    const progressWidth = Math.min(100, Math.max(relativeWidth, 12));

                    return (
                      <li key={scorer.playerId} className="leader-row">
                        <span
                          className="leader-progress"
                          style={{ width: `${progressWidth}%` }}
                          aria-hidden="true"
                        />
                        <div className="leader-info">
                          <span className="leader-rank">
                            {scorer.rank ?? index + 1}
                          </span>
                          <div className="leader-player">
                            <span className="leader-name">
                              {scorer.playerName}
                            </span>
                            <span className="leader-meta">
                              {scorer.teamShortName}
                            </span>
                          </div>
                        </div>
                        <span className="leader-goals">
                          {scorer.goals}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="panel-empty">
                  Goal leaders will populate once stats roll in.
                </div>
              )}
            </Surface>
          </div>
        </section>
      </div>
    </div>
  );
}
