'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error || !session?.user) {
          // No session, redirect to login
          console.log('No session found, redirecting to login');
          router.push('/admin/login');
          return;
        }

        // Check if user has admin role
        const userMetadata = session.user.user_metadata;
        const isAdmin = userMetadata?.role === 'admin' || userMetadata?.is_admin === true;

        if (!isAdmin) {
          // User is not admin, redirect to home
          console.log('User is not admin, redirecting to home');
          router.push('/');
          return;
        }

        // User is authenticated and is admin
        console.log('Admin access granted');
        setAuthorized(true);
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth check failed:', error);
        setError('Authentication check failed');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Listen for auth changes
  useEffect(() => {
    let isMounted = true;

    const supabase = getSupabaseBrowserClient();
    let subscription: any;

    const setupAuthListener = async () => {
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;

          if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('User signed out, redirecting to login');
            router.push('/admin/login');
          } else if (session?.user) {
            const userMetadata = session.user.user_metadata;
            const isAdmin = userMetadata?.role === 'admin' || userMetadata?.is_admin === true;

            if (!isAdmin) {
              console.log('User is not admin, redirecting to home');
              router.push('/');
            }
          }
        });
        subscription = data.subscription;
      } catch (error) {
        console.error('Failed to setup auth listener:', error);
      }
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router]);

  if (error) {
    return (
      <div>
        <div>
          <p>{error}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div>
          <div></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}