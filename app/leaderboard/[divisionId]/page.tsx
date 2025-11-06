import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Surface } from '@/components/ui/Surface';
import { TopScorersTable } from '@/components/TopScorersTable';
import ScorerSearch from '@/components/ScorerSearch';
import { MobileLeaderboardPage } from '@/components/mobile/MobileLeaderboardPage';
import { DivisionSelector } from '@/components/DivisionSelector';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { getDivisions } from '@/lib/getDivision';
import { getTopScorers } from '@/lib/getTopScorers';
import { resolveActiveDivision } from '@/lib/resolveDivision';

type LeaderboardPageProps = {
  params: {
    divisionId: string;
  };
};

export const revalidate = 30;

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { divisionId } = params;

  const divisions = await getDivisions();
  const { activeDivision, shouldRedirect } = resolveActiveDivision({
    divisions,
    requestedDivisionId: divisionId,
    fallbackDivisionId: DEFAULT_DIVISION_ID,
  });

  if (shouldRedirect) {
    redirect(`/leaderboard/${activeDivision.id}`);
  }

  const activeDivisionId = activeDivision.id;

  const scorers = await getTopScorers(activeDivisionId);
  const topScorersList = scorers.slice(0, 20);
  const totalGoalsTracked = scorers.reduce((acc, scorer) => acc + scorer.goals, 0);
  const clubsOnTheBoard = new Set(scorers.map((scorer) => scorer.teamShortName)).size;

  return (
    <>
      {/* Mobile Version */}
      <div className="mobile-only">
        <Surface variant="solid" padding="md" rounded="xl" className="dashboard-card">
          <DivisionSelector
            divisions={divisions}
            selectedDivisionId={activeDivisionId}
          />
        </Surface>
        <MobileLeaderboardPage
          divisionName={activeDivision.name}
          divisionId={activeDivisionId}
          scorers={scorers}
          totalGoalsTracked={totalGoalsTracked}
          clubsOnTheBoard={clubsOnTheBoard}
        />
      </div>

      {/* Desktop Version */}
      <div className="mobile-hidden">
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
                      {activeDivision.name}
                    </h1>
                    <DivisionSelector
                      divisions={divisions}
                      selectedDivisionId={activeDivisionId}
                    />
                  </div>
                  <Link
                    href={`/standings/${activeDivisionId}`}
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
      </div>
    </>
  );
}
