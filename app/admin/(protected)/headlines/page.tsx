import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { Surface } from '@/components/ui/Surface';
import { getHeadlinesForAdmin } from '@/lib/getHeadlinesForAdmin';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { HeadlineActions } from '@/components/HeadlineActions';
import { getDivisions } from '@/lib/getDivision';
import { resolveActiveDivision } from '@/lib/resolveDivision';
import { DivisionSelector } from '@/components/DivisionSelector';

function formatDate(dateString: string | null) {
  if (!dateString) return 'No date';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return 'No date';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

// No revalidation for admin pages - always fetch fresh data

type AdminHeadlinesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminHeadlinesPage({ searchParams }: AdminHeadlinesPageProps) {
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
    redirect(`/admin/headlines?divisionId=${activeDivision.id}`);
  }

  const divisionId = activeDivision.id;
  const headlines = await getHeadlinesForAdmin(divisionId, 50);

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface
          padding="lg"
          variant="muted"
        >
          <div>
            <h2>Headlines</h2>
            <p>
              Manage headlines that appear on the public dashboard. Edit or remove outdated content.
            </p>
            <DivisionSelector
              divisions={divisions}
              selectedDivisionId={divisionId}
            />
          </div>
          <Link
            href="/admin/add-headline"
          >
            + Add headline
          </Link>
        </Surface>
        <Surface padding="none">
          <div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Title</th>
                  <th scope="col">Match</th>
                  <th scope="col">Division</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {headlines.length > 0 ? (
                  headlines.map((headline) => (
                    <tr
                      key={headline.id}
                    >
                      <td>{formatDateTime(headline.created_at)}</td>
                      <td>
                        <div>
                          <strong>{headline.title}</strong>
                          {headline.body && (
                            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                              {headline.body.length > 100
                                ? `${headline.body.substring(0, 100)}...`
                                : headline.body}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {headline.matches ? (
                          <div>
                            <div>
                              {headline.matches.home_team?.short_name ?? 'Home'} vs {headline.matches.away_team?.short_name ?? 'Away'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              {formatDate(headline.matches.match_date)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>No match</span>
                        )}
                      </td>
                      <td>{headline.divisions?.name || 'Unknown'}</td>
                      <td>
                        <HeadlineActions headlineId={headline.id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      No headlines created yet.
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
