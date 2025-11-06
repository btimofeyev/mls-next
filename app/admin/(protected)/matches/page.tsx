import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { Surface } from '@/components/ui/Surface';
import { getMatchesForDivision } from '@/lib/getMatch';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { getDivisions } from '@/lib/getDivision';
import { resolveActiveDivision } from '@/lib/resolveDivision';
import { DivisionSelector } from '@/components/DivisionSelector';

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export const revalidate = 30;

type AdminMatchesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminMatchesPage({ searchParams }: AdminMatchesPageProps) {
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
    redirect(`/admin/matches?divisionId=${activeDivision.id}`);
  }

  const divisionId = activeDivision.id;
  const matches = await getMatchesForDivision(divisionId, 50);

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface
          padding="lg"
          variant="muted"
        >
          <div>
            <h2>Matches</h2>
            <p>
              Edit fixtures or verify results before publishing to the public feed.
            </p>
            <DivisionSelector
              divisions={divisions}
              selectedDivisionId={divisionId}
            />
          </div>
          <Link
            href="/admin/add-match"
          >
            + Add match
          </Link>
        </Surface>
        <Surface padding="none">
          <div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Fixture</th>
                  <th scope="col">Score</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <tr
                      key={match.id}
                    >
                      <td>{formatDate(match.match_date)}</td>
                      <td>
                        {match.home_team?.short_name ?? 'Home'} vs {match.away_team?.short_name ?? 'Away'}
                      </td>
                      <td>
                        {match.home_score} — {match.away_score}
                      </td>
                      <td>
                        <Link
                          href={`/admin/matches/${match.id}/edit`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      No matches recorded yet.
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
