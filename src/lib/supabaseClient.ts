import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

const runtimeEnv: RuntimeEnv =
  typeof import.meta !== 'undefined' && import.meta.env
    ? {
        SUPABASE_URL: import.meta.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
      }
    : (globalThis as typeof globalThis & { process?: { env?: RuntimeEnv } }).process?.env ?? {};

export const supabaseUrl = runtimeEnv.SUPABASE_URL;
export const supabaseAnonKey = runtimeEnv.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
