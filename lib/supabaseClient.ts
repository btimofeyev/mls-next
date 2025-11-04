import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
  } as const;
}

// Singleton instance for browser client
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, key } = getSupabaseConfig();
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
      },
    });
  }
  return browserClient;
}

export function createSupabaseServerClient(): SupabaseClient {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

// Legacy exports for backward compatibility
export const createSupabaseBrowserClient = getSupabaseBrowserClient;
