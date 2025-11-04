import { createSupabaseServerClient } from './supabaseClient';

type AdminUser = {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
};

function hasAdminPrivileges(metadata: Record<string, unknown> | undefined): boolean {
  if (!metadata) return false;
  const role = metadata['role'] as string | undefined;
  const isAdminFlag = metadata['is_admin'] as boolean | undefined;
  return role === 'admin' || isAdminFlag === true;
}

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = createSupabaseServerClient();

    // Get the current user session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return false;
    }

    // Check if user has admin role (you can store this in user_metadata or a separate table)
    // For now, we'll check user metadata
    const userMetadata = session.user.user_metadata;
    return hasAdminPrivileges(userMetadata);
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
}

export async function getCurrentAdmin() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    const userMetadata = session.user.user_metadata;
    const isAdmin = hasAdminPrivileges(userMetadata);

    if (!isAdmin) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: (userMetadata?.name as string | undefined) || session.user.email || '',
    };
  } catch (error) {
    console.error('Failed to get current admin:', error);
    return null;
  }
}

export async function getAdminFromToken(accessToken: string): Promise<AdminUser | null> {
  try {
    if (!accessToken) {
      return null;
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      return null;
    }

    const metadata = data.user.user_metadata ?? {};
    if (!hasAdminPrivileges(metadata)) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      metadata,
    };
  } catch (error) {
    console.error('Failed to validate admin token:', error);
    return null;
  }
}

export async function getAdminFromRequest(request: Request): Promise<AdminUser | null> {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  const tokenMatch = authHeader.match(/Bearer\s+(.+)/i);
  if (!tokenMatch) {
    return null;
  }

  const token = tokenMatch[1].trim();
  if (!token) {
    return null;
  }

  return getAdminFromToken(token);
}
