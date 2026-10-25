import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const id = body?.landing_id
  if (typeof id !== 'string' || !UUID.test(id)) return NextResponse.json({ ok: false }, { status: 400 })
  if (await isAdmin()) return NextResponse.json({ ok: true }) // ваші власні перегляди не рахуємо
  await supabase.rpc('track_view', { p_landing: id })
  return NextResponse.json({ ok: true })
}
