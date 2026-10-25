'use server'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim()

export async function addSpend(formData: FormData) {
  await requireAdmin()
  const day = str(formData, 'day')
  const amount = Number(str(formData, 'amount').replace(',', '.'))
  const landingId = str(formData, 'landing_id')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(amount) || amount <= 0 || !landingId) return
  await supabase.from('ad_spend').insert({ landing_id: landingId, day, amount })
  revalidatePath('/admin/ads')
  revalidatePath('/admin/stats')
}

export async function deleteSpend(formData: FormData) {
  await requireAdmin()
  await supabase.from('ad_spend').delete().eq('id', str(formData, 'id'))
  revalidatePath('/admin/ads')
  revalidatePath('/admin/stats')
}
