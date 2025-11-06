import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Surface } from '@/components/ui/Surface';
import { StandingsTable } from '@/components/StandingsTable';
import { DivisionSelector } from '@/components/DivisionSelector';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { getDivisions } from '@/lib/getDivision';
import { getStandings } from '@/lib/getStandings';
import { resolveActiveDivision } from '@/lib/resolveDivision';

type StandingsPageProps = {
  params: {
    divisionId: string;
  };
};

export const revalidate = 30;

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { divisionId } = params;

  const divisions = await getDivisions();
  const { activeDivision, shouldRedirect } = resolveActiveDivision({
    divisions,
    requestedDivisionId: divisionId,
    fallbackDivisionId: DEFAULT_DIVISION_ID,
  });

  if (shouldRedirect) {
    redirect(`/standings/${activeDivision.id}`);
  }

  const activeDivisionId = activeDivision.id;
  const standings = await getStandings(activeDivisionId);

  return (
    <div className="dashboard-shell standings-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="standings-header">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <div className="standings-header-content">
              <div className="standings-header-main">
                <div className="standings-header-eyebrow">
                  {activeDivision.league_id ? 'League Standings' : 'Division Standings'}
                </div>
                <h1 className="standings-header-title">
                  {activeDivision.name}
                </h1>
                <DivisionSelector
                  divisions={divisions}
                  selectedDivisionId={activeDivisionId}
                />
              </div>
              <Link
                href={`/leaderboard/${activeDivisionId}`}
                className="standings-header-action"
              >
                View scorers →
              </Link>
            </div>
          </Surface>
        </section>

        <section className="standings-main">
          <Surface variant="solid" padding="xl" rounded="2xl" className="dashboard-card">
            <div className="standings-section-header">
              <h2 className="standings-section-title">
                Full Table
              </h2>
            </div>
            <StandingsTable rows={standings} />
          </Surface>
        </section>

        <section className="standings-info">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <h3 className="standings-info-title">How standings are calculated</h3>
            <p className="standings-info-description">
              Points are awarded as 3 for a win, 1 for a draw, and 0 for a loss. Goal difference (GF − GA) and goals scored
              break ties when teams are level on points. Clean sheets often swing momentum in tight races.
            </p>
          </Surface>
        </section>
      </div>
    </div>
  );
}
