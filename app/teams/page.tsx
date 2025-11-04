import Link from 'next/link';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { getDivisionById } from '@/lib/getDivision';
import { getTeamsByDivision } from '@/lib/getTeams';
import { Surface } from '@/components/ui/Surface';

export const revalidate = 60;

export default async function TeamsIndexPage() {
  const divisionId = DEFAULT_DIVISION_ID;
  const [division, teams] = await Promise.all([getDivisionById(divisionId), getTeamsByDivision(divisionId)]);

  const totalClubs = teams.length;

  return (
    <div className="dashboard-shell teams-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <section className="teams-header">
          <Surface variant="solid" padding="md" rounded="2xl" className="dashboard-card teams-header-card">
            <div className="teams-header-content">
              <div className="teams-header-main">
                <div className="teams-header-eyebrow">
                  Club Directory
                </div>
                <h1 className="teams-header-title">
                  {division?.name ?? 'Division Teams'}
                </h1>
              </div>
            </div>
          </Surface>
        </section>

        <section className="teams-stats">
          <div className="teams-stats-compact">
            <div className="teams-stat-compact">
              <span className="teams-stat-icon">🏟️</span>
              <span className="teams-stat-value">{totalClubs}</span>
              <span className="teams-stat-label">Clubs</span>
            </div>
            <div className="teams-stat-compact">
              <span className="teams-stat-icon">🗺️</span>
              <span className="teams-stat-value">{division?.short_name ?? 'N/A'}</span>
              <span className="teams-stat-label">Division</span>
            </div>
          </div>
        </section>

        <section className="teams-main">
          {teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="team-card-link"
                >
                  <Surface variant="solid" padding="md" rounded="2xl" className="team-card">
                    <div className="team-card-content">
                      <div className="team-badge">
                        {team.badge_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={team.badge_url}
                            alt={`${team.name} badge`}
                            className="team-badge-img"
                          />
                        ) : (
                          <div className="team-badge-placeholder">
                            {team.short_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="team-info">
                        <span className="team-short-name">
                          {team.short_name.toUpperCase()}
                        </span>
                        <span className="team-full-name">
                          {team.name}
                        </span>
                      </div>
                    </div>
                  </Surface>
                </Link>
              ))}
            </div>
          ) : (
            <Surface variant="solid" padding="md" rounded="2xl" className="dashboard-card">
              <div className="teams-empty">
                <div className="teams-empty-icon">🏟️</div>
                <h3>No clubs yet</h3>
                <p>Clubs will appear once they are added to this division.</p>
              </div>
            </Surface>
          )}
        </section>
      </div>
    </div>
  );
}
