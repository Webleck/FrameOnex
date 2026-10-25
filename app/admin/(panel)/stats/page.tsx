import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { cardCls } from '@/lib/ui'

const PERIODS = [
  { key: 'today', label: 'Сьогодні' },
  { key: '7', label: '7 днів' },
  { key: '30', label: '30 днів' },
  { key: 'all', label: 'Увесь час' },
]

const kyivDay = (d: Date | string) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' })
function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const money = (n: number) => `${Math.round(n).toLocaleString('uk-UA')} грн`
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—')

type Row = {
  id: string; title: string
  views: number; orders: number; confirmed: number
  received: number; failed: number
  revenue: number; profit: number; pending: number; spend: number
}
const empty = (id: string, title: string): Row => ({
  id, title, views: 0, orders: 0, confirmed: 0, received: 0, failed: 0,
  revenue: 0, profit: 0, pending: 0, spend: 0,
})

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireAdmin()
  const { period = '7' } = await searchParams
  const today = kyivDay(new Date())
  const fromDay =
    period === 'all' ? null : period === 'today' ? today : period === '30' ? addDays(today, -29) : addDays(today, -6)

  let oq = supabase.from('orders').select('landing_id,status,price,cost_price,quantity,created_at')
  let sq = supabase.from('landing_stats').select('landing_id,views')
  let aq = supabase.from('ad_spend').select('landing_id,amount')
  if (fromDay) {
    oq = oq.gte('created_at', `${addDays(fromDay, -1)}T00:00:00Z`)
    sq = sq.gte('day', fromDay)
    aq = aq.gte('day', fromDay)
  }
  const [{ data: landings }, { data: orderRows }, { data: statRows }, { data: spendRows }] = await Promise.all([
    supabase.from('landings').select('id,title').order('created_at'),
    oq, sq, aq,
  ])

  const rows = new Map<string, Row>()
  for (const l of landings ?? []) rows.set(l.id, empty(l.id, l.title))

  for (const s of statRows ?? []) { const r = rows.get(s.landing_id); if (r) r.views += Number(s.views) }
  for (const a of spendRows ?? []) { const r = rows.get(a.landing_id); if (r) r.spend += Number(a.amount) }

  let ordersLoaded = 0
  for (const o of orderRows ?? []) {
    if (fromDay && kyivDay(o.created_at) < fromDay) continue
    const r = rows.get(o.landing_id)
    if (!r) continue
    ordersLoaded++
    const qty = Number(o.quantity) || 1
    const revenue = Number(o.price) * qty
    const profit = (Number(o.price) - Number(o.cost_price)) * qty
    r.orders++
    if (o.status !== 'new' && o.status !== 'cancelled') r.confirmed++
    if (o.status === 'received') { r.received++; r.revenue += revenue; r.profit += profit }
    else if (o.status === 'refused' || o.status === 'returned') r.failed++
    else if (['confirmed', 'sent_to_supplier', 'shipped'].includes(o.status)) r.pending += profit
  }
  const truncated = (orderRows?.length ?? 0) >= 1000

  const list = [...rows.values()].sort((a, b) => b.profit - b.spend - (a.profit - a.spend))
  const total = list.reduce((t, r) => {
    for (const k of ['views', 'orders', 'confirmed', 'received', 'failed', 'revenue', 'profit', 'pending', 'spend'] as const) t[k] += r[k]
    return t
  }, empty('total', 'Разом'))
  const net = (r: Row) => r.profit - r.spend
  const roi = (r: Row) => (r.spend > 0 ? `${Math.round((net(r) / r.spend) * 100)}%` : '—')
  const netCls = (n: number) => (n < 0 ? 'text-red-600' : 'text-teal-700')

  const cell = 'whitespace-nowrap p-3 text-right'
  const renderRow = (r: Row, bold = false) => (
    <tr key={r.id} className={bold ? 'bg-neutral-50 font-semibold' : ''}>
      <td className="p-3 text-left">{r.title}</td>
      <td className={cell}>{r.views}</td>
      <td className={cell}>{r.orders}</td>
      <td className={cell}>{pct(r.orders, r.views)}</td>
      <td className={cell}>{pct(r.confirmed, r.orders)}</td>
      <td className={cell}>{pct(r.received, r.received + r.failed)}</td>
      <td className={cell}>{money(r.revenue)}</td>
      <td className={cell}>{money(r.profit)}</td>
      <td className={cell}>{money(r.spend)}</td>
      <td className={`${cell} ${netCls(net(r))}`}>{money(net(r))}</td>
      <td className={cell}>{roi(r)}</td>
    </tr>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Статистика</h1>
        <div className="ml-auto flex gap-2">
          {PERIODS.map((p) => {
            const active = (period === p.key) || (!PERIODS.some((x) => x.key === period) && p.key === '7')
            return (
              <Link key={p.key} href={`/admin/stats?period=${p.key}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${active ? 'bg-teal-700 text-white' : 'bg-white hover:bg-neutral-50'}`}>
                {p.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Замовлень', String(total.orders)],
          ['Виручка (викуплені)', money(total.revenue)],
          ['Реклама', money(total.spend)],
          ['Чистий прибуток', money(net(total))],
          ['У дорозі (очікуваний)', money(total.pending)],
        ].map(([label, value]) => (
          <div key={label} className={cardCls}>
            <div className="text-sm text-neutral-500">{label}</div>
            <div className={`mt-1 text-xl font-bold ${label === 'Чистий прибуток' ? netCls(net(total)) : ''}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className={`${cardCls} overflow-x-auto p-0`}>
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-left">Лендінг</th>
              {['Перегляди', 'Замовлення', 'Конверсія', 'Підтверджено', 'Викуп', 'Виручка', 'Прибуток', 'Реклама', 'Чистий', 'ROI'].map((h) => (
                <th key={h} className="p-3 text-right font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((r) => renderRow(r))}
            {list.length > 0 && renderRow(total, true)}
            {list.length === 0 && <tr><td colSpan={11} className="p-6 text-center text-neutral-500">Лендінгів поки немає.</td></tr>}
          </tbody>
        </table>
      </div>

      {truncated && <p className="text-sm text-amber-700">Показано не всі замовлення (ліміт 1000). Оберіть коротший період.</p>}
      <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-500">
        <li>Виручка й прибуток рахуються за замовленнями зі статусом «Отримано»; прибуток = (ціна − закупівля) × кількість.</li>
        <li>Викуп = отримано / (отримано + відмови + повернення). Підтверджено = замовлення, що вийшли зі статусу «Нове» і не скасовані.</li>
        <li>Чистий = прибуток − реклама. ROI = чистий / реклама. «У дорозі» = очікуваний прибуток за підтвердженими, але ще не викупленими.</li>
        <li>Замовлення належать до періоду за датою створення. Ваші власні перегляди (коли ви ввійшли в адмінку) не рахуються.</li>
      </ul>
    </div>
  )
}
