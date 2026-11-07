import { redirect, notFound } from 'next/navigation'
import { supabaseUser } from './supabase-server'

export type PlanInfo = {
  code: string
  name: string
  price_uah: number
  max_landings: number | null
  max_orders_per_month: number | null
  custom_domain: boolean
}

export type Workspace = {
  id: string
  name: string
  slug: string
  subscription_status: string
  trial_ends_at: string | null
  current_period_end: string | null
  telegram_chat_id: string | null
  plan: PlanInfo
}

export const STATUS_LABELS: Record<string, string> = {
  trial: 'Пробний період',
  active: 'Активний',
  past_due: 'Прострочено',
  canceled: 'Скасовано',
}

// Скільки днів лишилось до кінця пробного періоду або оплаченого періоду (null = без обмеження)
export function daysLeft(ws: { trial_ends_at: string | null; current_period_end: string | null }): number | null {
  const end = ws.current_period_end ?? ws.trial_ends_at
  if (!end) return null
  return Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
}

export async function getUser() {
  const sb = await supabaseUser()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

const SELECT =
  'id, name, slug, subscription_status, trial_ends_at, current_period_end, telegram_chat_id, plans(code, name, price_uah, max_landings, max_orders_per_month, custom_domain)'

type Row = {
  id: string
  name: string
  slug: string
  subscription_status: string
  trial_ends_at: string | null
  current_period_end: string | null
  telegram_chat_id: string | null
  plans: PlanInfo | PlanInfo[] | null
}

function toWorkspace(r: Row): Workspace {
  const plan = Array.isArray(r.plans) ? r.plans[0] : r.plans
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    subscription_status: r.subscription_status,
    trial_ends_at: r.trial_ends_at,
    current_period_end: r.current_period_end,
    telegram_chat_id: r.telegram_chat_id,
    plan: plan ?? { code: 'free', name: 'Безкоштовний', price_uah: 0, max_landings: 1, max_orders_per_month: 30, custom_domain: false },
  }
}

function makeSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'shop'
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

// Повертає користувача та його workspace. Якщо workspace ще немає
// (наприклад, користувач щойно підтвердив email), створює його з назви, вказаної при реєстрації.
export async function requireWorkspace() {
  const user = await requireUser()
  const sb = await supabaseUser()

  const load = () => sb.from('workspaces').select(SELECT).order('created_at').limit(1).maybeSingle()

  const first = await load()
  if (first.data) return { user, workspace: toWorkspace(first.data as unknown as Row) }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fromMeta = typeof meta.workspace_name === 'string' ? meta.workspace_name.trim() : ''
  const name = (fromMeta || user.email?.split('@')[0] || 'Мій магазин').slice(0, 60)

  for (let i = 0; i < 3; i++) {
    const { error } = await sb.rpc('create_workspace', { p_name: name, p_slug: makeSlug(name) })
    if (!error) break
    if (error.code !== '23505') throw new Error(error.message) // 23505 = slug зайнятий, пробуємо ще
  }

  const again = await load()
  if (!again.data) throw new Error('Не вдалося створити робочий простір')
  return { user, workspace: toWorkspace(again.data as unknown as Row) }
}

export async function isSuperAdmin() {
  const sb = await supabaseUser()
  const { data } = await sb.rpc('is_super_admin')
  return data === true
}

// Для сторінок і дій супер-адмінки. Чужим показуємо 404.
export async function requireSuperAdmin() {
  await requireUser()
  if (!(await isSuperAdmin())) notFound()
}
