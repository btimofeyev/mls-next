import { Surface } from '@/components/ui/Surface';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { getScoreCorrections } from '@/lib/getScoreCorrections';
import { AdminCorrectionsTable } from '@/app/admin/components/AdminCorrectionsTable';

export const revalidate = 30;

export default async function AdminCorrectionsPage() {
  const corrections = await getScoreCorrections();
  const pendingCount = corrections.filter((item) => item.status === 'pending').length;

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <div>
            <h2>Score Corrections</h2>
            <p>
              Review crowd-sourced updates for scores, goal scorers, or other match context. Mark each request once it has
              been verified.
            </p>
          </div>
          <div>
            Pending requests: <strong>{pendingCount}</strong>
          </div>
        </Surface>

        <Surface padding="none">
          <AdminCorrectionsTable corrections={corrections} />
        </Surface>
      </div>
    </AdminPageWrapper>
  );
}
