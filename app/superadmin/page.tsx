import type { Metadata } from 'next'
import { requireSuperAdmin, STATUS_LABELS } from '@/lib/session'
import { supabaseUser } from '@/lib/supabase-server'
import { setWorkspaceAction } from './actions'
import { cardCls } from '@/lib/ui'

export const metadata: Metadata = { title: 'Супер-адмінка — FrameOnex' }

type WsRow = {
  workspace_id: string
  workspace_name: string
  slug: string
  owner_email: string | null
  plan_code: string
  plan_name: string
  price_uah: number
  subscription_status: string
  ends_at: string | null
  days_left: number | null
  landings_count: number
  orders_count: number
  created_at: string
}

type UserRow = {
  user_id: string
  email: string
  registered_at: string
  last_sign_in_at: string | null
  workspace_name: string | null
  subscription_status: string | null
}

type PlanRow = { code: string; name: string }

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('uk-UA') : '—')
const small = 'rounded border border-neutral-300 bg-white px-2 py-1 text-xs'

function DaysBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-neutral-500">без обмеження</span>
  if (days < 0) return <span className="font-semibold text-red-600">закінчився ({-days} дн. тому)</span>
  if (days <= 3) return <span className="font-semibold text-amber-600">{days} дн.</span>
  return <span>{days} дн.</span>
}

export default async function SuperAdminPage() {
  await requireSuperAdmin()
  const sb = await supabaseUser()

  const [wsRes, usersRes, plansRes] = await Promise.all([
    sb.rpc('admin_workspaces_overview'),
    sb.rpc('admin_users_overview'),
    sb.from('plans').select('code, name').order('price_uah'),
  ])

  const error = wsRes.error?.message ?? usersRes.error?.message
  const workspaces = (wsRes.data ?? []) as WsRow[]
  const users = (usersRes.data ?? []) as UserRow[]
  const plans = (plansRes.data ?? []) as PlanRow[]

  const paying = workspaces.filter((w) => w.subscription_status === 'active' && w.price_uah > 0).length
  const trial = workspaces.filter((w) => w.subscription_status === 'trial').length
  const expiring = workspaces.filter(
    (w) => ['trial', 'active'].includes(w.subscription_status) && w.days_left !== null && w.days_left >= 0 && w.days_left <= 3
  ).length

  return (
    <>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Помилка: {error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={cardCls}><p className="text-sm text-neutral-500">Користувачів</p><p className="text-2xl font-bold">{users.length}</p></div>
        <div className={cardCls}><p className="text-sm text-neutral-500">На пробному</p><p className="text-2xl font-bold">{trial}</p></div>
        <div className={cardCls}><p className="text-sm text-neutral-500">Платних активних</p><p className="text-2xl font-bold">{paying}</p></div>
        <div className={cardCls}><p className="text-sm text-neutral-500">Закінчується за 3 дні</p><p className="text-2xl font-bold">{expiring}</p></div>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Клієнти і тарифи</h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-3">Клієнт</th>
                <th className="p-3">Тариф</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Залишилось</th>
                <th className="p-3">Лендінги</th>
                <th className="p-3">Замовлення</th>
                <th className="p-3">Реєстрація</th>
                <th className="p-3">Керування</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w.workspace_id} className="border-b border-neutral-100 align-top last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{w.workspace_name}</div>
                    <div className="text-xs text-neutral-500">{w.owner_email ?? '—'}</div>
                  </td>
                  <td className="p-3">{w.plan_name}{w.price_uah > 0 && <span className="text-neutral-500"> · {w.price_uah} ₴</span>}</td>
                  <td className="p-3">{STATUS_LABELS[w.subscription_status] ?? w.subscription_status}</td>
                  <td className="p-3"><DaysBadge days={w.days_left} /><div className="text-xs text-neutral-500">до {fmt(w.ends_at)}</div></td>
                  <td className="p-3">{w.landings_count}</td>
                  <td className="p-3">{w.orders_count}</td>
                  <td className="p-3">{fmt(w.created_at)}</td>
                  <td className="p-3">
                    <form action={setWorkspaceAction} className="flex flex-wrap items-center gap-1">
                      <input type="hidden" name="id" value={w.workspace_id} />
                      <select name="plan" defaultValue={w.plan_code} className={small}>
                        {plans.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                      </select>
                      <select name="status" defaultValue={w.subscription_status} className={small}>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <input name="extend" type="number" step="1" placeholder="± днів" className={`${small} w-20`} />
                      <button className="rounded bg-teal-700 px-2 py-1 text-xs font-semibold text-white hover:bg-teal-800">Зберегти</button>
                    </form>
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr><td colSpan={8} className="p-4 text-center text-neutral-500">Поки немає клієнтів</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Зареєстровані користувачі</h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Магазин</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Зареєстрований</th>
                <th className="p-3">Останній вхід</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.workspace_name ?? '—'}</td>
                  <td className="p-3">{u.subscription_status ? STATUS_LABELS[u.subscription_status] ?? u.subscription_status : '—'}</td>
                  <td className="p-3">{fmt(u.registered_at)}</td>
                  <td className="p-3">{fmt(u.last_sign_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
