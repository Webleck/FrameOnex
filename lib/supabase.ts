import { createClient } from '@supabase/supabase-js'

// Тільки для серверного коду. Ключ service role ніколи не потрапляє в браузер.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
