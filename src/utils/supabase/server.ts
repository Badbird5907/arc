import "server-only";

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from "@/env";

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    env.SUPABASE_PROJECT_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}