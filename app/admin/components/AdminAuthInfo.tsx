'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export function AdminAuthInfo() {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          setUserName(userMetadata?.name || session.user.email || '');
          setUserEmail(session.user.email || '');
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-account-card">
      <div className="admin-account-meta">
        <span className="admin-account-badge">
          Admin
        </span>
        <span className="admin-account-name">{userName || '—'}</span>
        <span className="admin-account-email">{userEmail}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="admin-account-signout"
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
}
