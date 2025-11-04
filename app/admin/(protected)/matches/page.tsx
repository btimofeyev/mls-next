import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { Surface } from '@/components/ui/Surface';
import { getMatchesForDivision } from '@/lib/getMatch';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export const revalidate = 30;

export default async function AdminMatchesPage() {
  const divisionId = DEFAULT_DIVISION_ID;
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
