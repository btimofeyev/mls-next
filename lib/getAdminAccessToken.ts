import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAdminAccessToken(supabase: SupabaseClient): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token || !session.user) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const metadata = session.user.user_metadata ?? {};
  const role = metadata.role as string | undefined;
  const isAdminFlag = metadata.is_admin as boolean | undefined;

  if (role !== 'admin' && isAdminFlag !== true) {
    throw new Error('Admin privileges are required to complete this action.');
  }

  return session.access_token;
}
