import { MatchForm } from '@/components/MatchForm';
import { Surface } from '@/components/ui/Surface';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

export default function AddMatchPage() {
  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <h2>Add Match</h2>
          <p>Log final scores and the full goal log for this fixture.</p>
        </Surface>
        <MatchForm mode="create" />
      </div>
    </AdminPageWrapper>
  );
}
