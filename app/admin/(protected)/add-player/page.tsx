import { PlayerForm } from '@/components/PlayerForm';
import { Surface } from '@/components/ui/Surface';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

export default function AddPlayerPage() {
  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <h2>Add Player</h2>
          <p>Register a new player to their club roster.</p>
        </Surface>
        <PlayerForm mode="create" />
      </div>
    </AdminPageWrapper>
  );
}
