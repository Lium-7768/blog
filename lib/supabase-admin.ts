// lib/supabase-admin.ts - Server-side only! Uses Service Role Key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Admin client - bypasses RLS, use with caution!
// Lazy initialization to avoid errors during build
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (adminClient) {
    return adminClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase Admin credentials. Check SUPABASE_SERVICE_ROLE_KEY env var.'
    )
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}