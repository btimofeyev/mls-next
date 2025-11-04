'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function AdminLoginForm() {
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
      const supabase = createSupabaseBrowserClient();

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
      <div>
        {/* Header */}
        <div>
          <h1>Admin Login</h1>
          <p>
            MLS NEXT Pulse Administrative Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div>
              {error}
            </div>
          )}

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

        {/* Back Link */}
        <div>
          <a href="/">
            ← Back to MLS NEXT Pulse
          </a>
        </div>
      </div>

      {/* Info Box */}
      <div>
        <p>
          Access to this area is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}