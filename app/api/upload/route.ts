import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 })
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Файл не знайдено' }, { status: 400 })
  const ext = EXT[file.type]
  if (!ext) return NextResponse.json({ error: 'Дозволені лише JPG, PNG, WebP, GIF' }, { status: 400 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'Файл більший за 4 МБ' }, { status: 400 })

  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('landing-images')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) return NextResponse.json({ error: 'Не вдалося завантажити: ' + error.message }, { status: 500 })

  const { data } = supabase.storage.from('landing-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
