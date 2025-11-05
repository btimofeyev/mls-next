'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getAdminAccessToken } from '@/lib/getAdminAccessToken';

type HeadlineActionsProps = {
  headlineId: string;
};

export function HeadlineActions({ headlineId }: HeadlineActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this headline?')) {
      try {
        const supabase = createSupabaseBrowserClient();
        const accessToken = await getAdminAccessToken(supabase);

        const response = await fetch(`/api/headlines/${headlineId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          // Use Next.js router to refresh the page data
          router.refresh();
        } else {
          const errorData = await response.json().catch(() => null);
          alert(errorData?.error || 'Failed to delete headline');
        }
      } catch (error) {
        alert('Failed to delete headline');
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link
        href={`/admin/headlines/${headlineId}/edit`}
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        style={{
          background: 'none',
          border: 'none',
          color: '#dc3545',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          textDecoration: 'underline',
          fontSize: 'inherit',
        }}
      >
        Delete
      </button>
    </div>
  );
}