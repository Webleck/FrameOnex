import Link from 'next/link'
import type { Metadata } from 'next'
import { requireWorkspace, isSuperAdmin, daysLeft, STATUS_LABELS } from '@/lib/session'
import { supabaseUser } from '@/lib/supabase-server'
import { logoutAction } from '@/app/actions/auth'
import { btn2Cls, cardCls } from '@/lib/ui'

export const metadata: Metadata = { title: 'Кабінет — FrameOnex' }

export default async function Dashboard() {
  const { user, workspace: ws } = await requireWorkspace()
  const sb = await supabaseUser()

  const [landings, orders, superAdmin] = await Promise.all([
    sb.from('landings').select('id', { count: 'exact', head: true }),
    sb.rpc('orders_this_month', { ws: ws.id }),
    isSuperAdmin(),
  ])

  const landingsCount = landings.count ?? 0
  const ordersCount = typeof orders.data === 'number' ? orders.data : 0
  const left = daysLeft(ws)
  const lim = (v: number | null) => (v === null ? '∞' : String(v))

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-teal-700">FrameOnex</Link>
          <div className="flex items-center gap-2">
            {superAdmin && <Link href="/superadmin" className={btn2Cls}>Супер-адмінка</Link>}
            <form action={logoutAction}>
              <button className={btn2Cls}>Вийти</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-bold">{ws.name}</h1>
          <p className="text-sm text-neutral-600">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className={cardCls}>
            <p className="text-sm text-neutral-500">Тариф</p>
            <p className="mt-1 text-xl font-semibold">{ws.plan.name}</p>
            <p className="text-sm text-neutral-600">{STATUS_LABELS[ws.subscription_status] ?? ws.subscription_status}</p>
          </div>
          <div className={cardCls}>
            <p className="text-sm text-neutral-500">Залишилось днів</p>
            <p className={`mt-1 text-xl font-semibold ${left !== null && left <= 3 ? 'text-red-600' : ''}`}>
              {left === null ? 'без обмеження' : left > 0 ? left : 'закінчився'}
            </p>
          </div>
          <div className={cardCls}>
            <p className="text-sm text-neutral-500">Використання</p>
            <p className="mt-1 text-sm">Лендінги: <b>{landingsCount} / {lim(ws.plan.max_landings)}</b></p>
            <p className="text-sm">Замовлення за місяць: <b>{ordersCount} / {lim(ws.plan.max_orders_per_month)}</b></p>
          </div>
        </div>

        <div className={cardCls}>
          <h2 className="font-semibold">Редактор лендінгів і замовлення</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Цей розділ підключається наступним кроком: тут з’являться ваші лендінги, редактор, замовлення та статистика.
          </p>
          {superAdmin && (
            <Link href="/admin" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
              Відкрити стару адмінку (/admin)
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
