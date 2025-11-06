import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { Surface } from '@/components/ui/Surface';
import { getPlayersForDivision } from '@/lib/getPlayers';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { getDivisions } from '@/lib/getDivision';
import { resolveActiveDivision } from '@/lib/resolveDivision';
import { DivisionSelector } from '@/components/DivisionSelector';

export const revalidate = 30;

type AdminPlayersPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminPlayersPage({ searchParams }: AdminPlayersPageProps) {
  const divisions = await getDivisions();
  const requestedDivisionId = typeof searchParams?.divisionId === 'string'
    ? searchParams.divisionId
    : undefined;

  const { activeDivision, shouldRedirect } = resolveActiveDivision({
    divisions,
    requestedDivisionId,
    fallbackDivisionId: DEFAULT_DIVISION_ID,
  });

  if (shouldRedirect) {
    redirect(`/admin/players?divisionId=${activeDivision.id}`);
  }

  const divisionId = activeDivision.id;
  const players = await getPlayersForDivision(divisionId);

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <div>
            <h2>Players</h2>
            <p>Manage roster details for the active division.</p>
            <DivisionSelector
              divisions={divisions}
              selectedDivisionId={divisionId}
            />
          </div>
          <Link
            href="/admin/add-player"
          >
            + Add player
          </Link>
        </Surface>

        <Surface padding="none">
          <div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Team</th>
                  <th scope="col">Number</th>
                  <th scope="col">Position</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.length > 0 ? (
                  players.map((player) => (
                    <tr
                      key={player.id}
                    >
                      <td>{player.name}</td>
                      <td>{player.team?.short_name ?? '—'}</td>
                      <td>{player.number ?? '—'}</td>
                      <td>{player.position ?? '—'}</td>
                      <td>
                        <Link
                          href={`/admin/players/${player.id}/edit`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      No players found for this division.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </AdminPageWrapper>
  );
}
