import { notFound } from 'next/navigation';
import { EditHeadlineForm } from '@/components/EditHeadlineForm';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { getHeadlineById } from '@/lib/getHeadlinesForAdmin';

interface EditHeadlinePageProps {
  params: {
    headlineId: string;
  };
}

export default async function EditHeadlinePage({ params }: EditHeadlinePageProps) {
  try {
    const headline = await getHeadlineById(params.headlineId);

    return (
      <AdminPageWrapper>
        <div className="admin-content-stack">
          <div>
            <h2>Edit Headline</h2>
            <p>
              Update the headline details and content.
            </p>
          </div>
          <EditHeadlineForm
            headlineId={params.headlineId}
            initialData={headline}
          />
        </div>
      </AdminPageWrapper>
    );
  } catch (error) {
    notFound();
  }
}