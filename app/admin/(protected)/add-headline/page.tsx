import { AddHeadlineForm } from '@/components/AddHeadlineForm';
import { Surface } from '@/components/ui/Surface';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

export default function AddHeadlinePage() {
  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <h2>Add Headline</h2>
          <p>Post a quick recap to highlight stand-out performances.</p>
        </Surface>
        <AddHeadlineForm />
      </div>
    </AdminPageWrapper>
  );
}
