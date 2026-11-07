'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/lib/session'
import { supabaseUser } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'

const STATUSES = ['trial', 'active', 'past_due', 'canceled']

// Змінити тариф, статус або продовжити дні клієнта
export async function setWorkspaceAction(formData: FormData) {
  await requireSuperAdmin()

  const id = String(formData.get('id') ?? '')
  const plan = String(formData.get('plan') ?? '')
  const status = String(formData.get('status') ?? '')
  const extendRaw = String(formData.get('extend') ?? '').trim()
  const extend = extendRaw === '' ? null : Math.round(Number(extendRaw))

  if (!id) throw new Error('Не вказано клієнта')
  if (status && !STATUSES.includes(status)) throw new Error('Невірний статус')
  if (extend !== null && (!Number.isFinite(extend) || Math.abs(extend) > 3650)) throw new Error('Невірна кількість днів')

  const sb = await supabaseUser()
  const { error } = await sb.rpc('admin_set_workspace', {
    p_workspace: id,
    p_plan_code: plan || null,
    p_status: status || null,
    p_extend_days: extend && extend !== 0 ? extend : null,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/superadmin')
}

// "Видалити" шаблон: він зникає зі списку для всіх клієнтів
export async function deleteTemplateAction(formData: FormData) {
  await requireSuperAdmin()
  const key = String(formData.get('key') ?? '')
  if (!TEMPLATES.some((t) => t.key === key)) throw new Error('Невідомий шаблон')

  const sb = await supabaseUser()
  const {
    data: { user },
  } = await sb.auth.getUser()
  const { error } = await sb
    .from('deleted_templates')
    .upsert({ template_key: key, deleted_by: user?.id ?? null })
  if (error) throw new Error(error.message)

  revalidatePath('/superadmin/templates')
}

// Повернути видалений шаблон
export async function restoreTemplateAction(formData: FormData) {
  await requireSuperAdmin()
  const key = String(formData.get('key') ?? '')

  const sb = await supabaseUser()
  const { error } = await sb.from('deleted_templates').delete().eq('template_key', key)
  if (error) throw new Error(error.message)

  revalidatePath('/superadmin/templates')
}
