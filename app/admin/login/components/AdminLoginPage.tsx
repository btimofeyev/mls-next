'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Invalid login credentials');
        return;
      }

      if (data.user) {
        const userMetadata = data.user.user_metadata;
        const isAdmin = userMetadata?.role === 'admin' || userMetadata?.is_admin === true;

        if (!isAdmin) {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
          return;
        }

        // Successfully authenticated as admin
        router.push(redirectTo);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div>
      <Container>
        <Surface padding="lg">
          <div>
            <span>
              MLS NEXT Pulse
            </span>
            <h1>Admin Login</h1>
            <p>
              Administrative access required to manage fixtures, rosters, and headlines.
            </p>
          </div>

          {error && (
            <div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div>
            <Link href="/">
              ← Back to MLS NEXT Pulse
            </Link>
          </div>
        </Surface>

        <Surface padding="md" variant="muted">
          Access to this area is restricted to authorized administrators only. Contact league operations if you need
          credentials.
        </Surface>
      </Container>
    </div>
  );
}
