import "server-only";

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from 'next/headers';
import { env } from "@/env";

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.SUPABASE_PROJECT_URL,
    env.SUPABASE_SECRET_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
export async function createBareServerClient() {
  return createSupabaseClient(
    env.SUPABASE_PROJECT_URL,
    env.SUPABASE_SECRET_KEY
  )
}