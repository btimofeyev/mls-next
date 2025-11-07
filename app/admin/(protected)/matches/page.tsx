import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';
import { Surface } from '@/components/ui/Surface';
import { getMatchesForDivision } from '@/lib/getMatch';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { getDivisions } from '@/lib/getDivision';
import { resolveActiveDivision } from '@/lib/resolveDivision';
import { DivisionSelector } from '@/components/DivisionSelector';
import { AdminMatchesTable } from '@/app/admin/components/AdminMatchesTable';

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
  const matches = await getMatchesForDivision(divisionId);

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
          <AdminMatchesTable matches={matches} />
        </Surface>
      </div>
    </AdminPageWrapper>
  );
}
