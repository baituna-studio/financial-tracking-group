import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Admin (server-only) client to call auth.admin and bypass RLS where appropriate
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing env vars:', { url: !!url, serviceKey: !!serviceKey })
    throw new Error('Supabase Admin client missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
