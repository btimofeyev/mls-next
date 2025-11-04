import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopScorersTable } from '@/components/TopScorersTable';
import { Surface } from '@/components/ui/Surface';
import { getTeamPageData } from '@/lib/getTeamData';
import type { ScorerRow } from '@/lib/types';

type TeamPageProps = {
  params: {
    teamId: string;
  };
};

export const revalidate = 30;

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = params;

  const data = await getTeamPageData(teamId);
  if (!data) {
    notFound();
  }

  const { team, division, record, recentMatches, topScorers } = data;

  const teamScorers: ScorerRow[] = topScorers.map((scorer) => ({
    rank: undefined,
    playerId: scorer.playerId,
    playerName: scorer.playerName,
    teamId: team.id,
    teamShortName: team.short_name,
    goals: scorer.goals,
    matchesWithGoal: scorer.matchesWithGoal,
  }));

  const totalMatches = recentMatches.length;

  const formatMatchDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <div className="dashboard-shell team-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="team-header">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <div className="team-header-content">
              <div className="team-header-main">
                <div className="team-badge-large">
                  {team.badge_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={team.badge_url}
                      alt={`${team.name} badge`}
                      className="team-badge-img-large"
                    />
                  ) : (
                    <div className="team-badge-placeholder-large">
                      {team.short_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="team-info-large">
                  <h1 className="team-title">
                    {team.name}
                  </h1>
                  {division && (
                    <p className="team-division">
                      {division.short_name ?? division.name}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={division ? `/standings/${division.id}` : '/'}
                className="team-back-link"
              >
                ← Standings
              </Link>
            </div>

            {record ? (
              <div className="team-stats-compact">
                <div className="team-stat-compact">
                  <span className="team-stat-value">{record.w}-{record.d}-{record.l}</span>
                  <span className="team-stat-label">Record</span>
                </div>
                <div className="team-stat-compact">
                  <span className="team-stat-value">{record.points}</span>
                  <span className="team-stat-label">PTS</span>
                </div>
                <div className="team-stat-compact">
                  <span className="team-stat-value">{record.gd > 0 ? `+${record.gd}` : record.gd.toString()}</span>
                  <span className="team-stat-label">GD</span>
                </div>
                <div className="team-stat-compact">
                  <span className="team-stat-value">{record.gf}</span>
                  <span className="team-stat-label">GF</span>
                </div>
              </div>
            ) : (
              <div className="team-no-matches">
                <span className="team-no-matches-icon">📅</span>
                <p>
                  No matches recorded yet.
                </p>
              </div>
            )}
          </Surface>
        </section>

        <section className="team-content">
          <div className="team-content-compact">
            <Surface variant="solid" padding="md" rounded="2xl" className="dashboard-card">
              <div className="team-section-header">
                <h2 className="team-section-title">Recent Results</h2>
                <span className="team-section-subtitle">
                  Last {Math.min(totalMatches, 5)}
                </span>
              </div>

              {recentMatches.length > 0 ? (
                <div className="team-matches-compact">
                  <ul className="team-matches-list">
                    {recentMatches.map((match) => (
                      <li key={match.matchId} className="team-match-compact">
                        <div className="team-match-header">
                          <span className="team-match-date">{formatMatchDate(match.matchDate)}</span>
                          <span className="team-match-venue">{match.isHome ? 'H' : 'A'}</span>
                        </div>
                        <div className="team-match-content-compact">
                          <span className="team-match-opponent">
                            {match.isHome ? 'vs' : '@'} {match.opponent.shortName}
                          </span>
                          <div className="team-match-score">
                            <span className={`team-match-score-team ${match.outcome === 'W' ? 'win' : match.outcome === 'D' ? 'draw' : 'loss'}`}>
                              {match.teamScore}
                            </span>
                            <span className="team-match-score-separator">—</span>
                            <span className="team-match-score-opponent">
                              {match.opponentScore}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="team-empty-compact">
                  <span className="team-empty-icon">⚽</span>
                  <p>No matches yet.</p>
                </div>
              )}
            </Surface>

            </div>
        </section>

        <section className="team-scorers">
          <Surface variant="solid" padding="md" rounded="2xl" className="dashboard-card">
            <div className="team-section-header">
              <h2 className="team-section-title">Team Top Scorers</h2>
            </div>
            <div className="team-scorers-container">
              <TopScorersTable
                scorers={teamScorers}
                showMatchesColumn
              />
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}
