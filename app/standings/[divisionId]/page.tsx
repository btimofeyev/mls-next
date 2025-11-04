import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Surface } from '@/components/ui/Surface';
import { StandingsTable } from '@/components/StandingsTable';
import { getDivisionById } from '@/lib/getDivision';
import { getStandings } from '@/lib/getStandings';

type StandingsPageProps = {
  params: {
    divisionId: string;
  };
};

export const revalidate = 30;

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { divisionId } = params;

  const division = await getDivisionById(divisionId);
  if (!division) {
    notFound();
  }

  const standings = await getStandings(divisionId);

  return (
    <div className="dashboard-shell standings-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="standings-header">
          <Surface variant="solid" padding="lg" rounded="2xl" className="dashboard-card">
            <div className="standings-header-content">
              <div className="standings-header-main">
                <div className="standings-header-eyebrow">
                  {division.league_id ? 'League Standings' : 'Division Standings'}
                </div>
                <h1 className="standings-header-title">
                  {division.name}
                </h1>
              </div>
              <Link
                href={`/leaderboard/${divisionId}`}
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
