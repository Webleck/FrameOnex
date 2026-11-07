import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Клієнт від імені поточного користувача: діють політики RLS.
// Лише для серверного коду. (lib/supabase.ts з service role лишається для службових запитів.)
export async function supabaseUser() {
  const jar = await cookies()
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options))
        } catch {
          // у Server Components куки не записуються, їх оновлює middleware
        }
      },
    },
  })
}
