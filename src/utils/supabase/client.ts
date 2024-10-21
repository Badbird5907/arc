import { env } from '@/env'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    env.SUPABASE_PROJECT_URL,
    env.SUPABASE_ANON_KEY
  )
}