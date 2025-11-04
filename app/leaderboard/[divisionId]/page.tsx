import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Surface } from '@/components/ui/Surface';
import { TopScorersTable } from '@/components/TopScorersTable';
import ScorerSearch from '@/components/ScorerSearch';
import { getDivisionById } from '@/lib/getDivision';
import { getTopScorers } from '@/lib/getTopScorers';

type LeaderboardPageProps = {
  params: {
    divisionId: string;
  };
};

export const revalidate = 30;

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { divisionId } = params;

  const division = await getDivisionById(divisionId);
  if (!division) {
    notFound();
  }

  const scorers = await getTopScorers(divisionId);
  const topScorer = scorers[0];
  const topScorersList = scorers.slice(0, 20);
  const totalGoalsTracked = scorers.reduce((acc, scorer) => acc + scorer.goals, 0);
  const clubsOnTheBoard = new Set(scorers.map((scorer) => scorer.teamShortName)).size;

  return (
    <div className="dashboard-shell leaderboard-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="leaderboard-header">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <div className="leaderboard-header-content">
              <div className="leaderboard-header-main">
                <div className="leaderboard-header-eyebrow">
                  Golden Boot Radar
                </div>
                <h1 className="leaderboard-header-title">
                  {division.name}
                </h1>
              </div>
              <Link
                href={`/standings/${divisionId}`}
                className="leaderboard-header-action"
              >
                View standings →
              </Link>
            </div>
          </Surface>
        </section>

        <section className="leaderboard-main">
          <Surface variant="solid" padding="xl" rounded="2xl" className="dashboard-card">
            <div className="leaderboard-section-header">
              <h2 className="leaderboard-section-title">
                Top 20 Goal Scorers
              </h2>
              <div className="leaderboard-section-subtitle">
                Search any player name to find their ranking
              </div>
            </div>

            {/* Search Component */}
            <ScorerSearch scorers={scorers} />

            {/* Top 20 Scorers */}
            <div className="scorers-list-container">
              <TopScorersTable
                scorers={topScorersList}
                showMatchesColumn
              />
            </div>
          </Surface>
        </section>

        <section className="leaderboard-info">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <h3 className="leaderboard-info-title">Leaderboard rules</h3>
            <ul className="leaderboard-info-list">
              <li>Only credited goals count toward a player&apos;s total — own goals are ignored.</li>
              <li>Hat tricks and braces push players into the home feed, spotlighting streaks automatically.</li>
            </ul>
          </Surface>
        </section>
      </div>
    </div>
  );
}
