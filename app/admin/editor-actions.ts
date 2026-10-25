'use server'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { fromPuckData, rootSettings } from '@/lib/blocks'

type Result = { ok: boolean; error?: string }

function normalize(data: unknown) {
  const blocks = fromPuckData(data)
  const settings = rootSettings(data)
  return { blocks, settings, size: JSON.stringify({ blocks, settings }).length }
}

// Автозбереження: пишемо лише в чернетку, живий лендінг не змінюється
export async function saveDraft(id: string, data: unknown): Promise<Result> {
  await requireAdmin()
  const { blocks, settings, size } = normalize(data)
  if (size > 200_000) return { ok: false, error: 'Сторінка завелика' }
  const { error } = await supabase.from('landings').update({ draft: { blocks, settings } }).eq('id', id)
  if (error) return { ok: false, error: 'Не вдалося зберегти чернетку' }
  revalidatePath('/admin/landings')
  return { ok: true }
}

// Публікація: чернетка стає живою версією
export async function publishLanding(id: string, data: unknown): Promise<Result> {
  await requireAdmin()
  const { blocks, settings, size } = normalize(data)
  if (size > 200_000) return { ok: false, error: 'Сторінка завелика' }
  const { data: cur } = await supabase.from('landings').select('slug,settings').eq('id', id).maybeSingle()
  if (!cur) return { ok: false, error: 'Лендінг не знайдено' }
  const { error } = await supabase
    .from('landings')
    .update({ blocks, settings: { ...(cur.settings ?? {}), ...settings }, draft: null })
    .eq('id', id)
  if (error) return { ok: false, error: 'Не вдалося опублікувати' }
  revalidatePath(`/l/${cur.slug}`)
  revalidatePath('/admin/landings')
  return { ok: true }
}
