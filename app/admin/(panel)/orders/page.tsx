import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { ORDER_STATUSES } from '@/lib/constants'
import { updateOrder } from '../../actions'
import { inputCls, btnCls, btn2Cls, cardCls } from '@/lib/ui'

type SP = { status?: string; landing?: string }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin()
  const sp = await searchParams

  const { data: landings } = await supabase.from('landings').select('id,title').order('created_at')
  let q = supabase
    .from('orders')
    .select('*, landings(title), products(name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (sp.status) q = q.eq('status', sp.status)
  if (sp.landing) q = q.eq('landing_id', sp.landing)
  const { data: orders, error } = await q

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Замовлення</h1>

      <form className={`${cardCls} flex flex-wrap items-end gap-3`}>
        <label className="text-sm">Статус
          <select name="status" defaultValue={sp.status ?? ''} className={`${inputCls} mt-1`}>
            <option value="">Усі</option>
            {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label className="text-sm">Лендінг
          <select name="landing" defaultValue={sp.landing ?? ''} className={`${inputCls} mt-1`}>
            <option value="">Усі</option>
            {(landings ?? []).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </label>
        <button className={btnCls}>Фільтрувати</button>
      </form>

      {error && <p className="text-red-600">Не вдалося завантажити замовлення: {error.message}</p>}

      <div className={`${cardCls} overflow-x-auto p-0`}>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3">Дата</th>
              <th className="p-3">Клієнт</th>
              <th className="p-3">Товар</th>
              <th className="p-3">Сума</th>
              <th className="p-3">Лендінг</th>
              <th className="p-3">Статус і ТТН</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="align-top">
                <td className="whitespace-nowrap p-3">
                  {new Date(o.created_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Kyiv' })}
                </td>
                <td className="p-3">
                  <div className="font-medium">{o.customer_name}</div>
                  <a href={`tel:${o.phone}`} className="text-teal-700">{o.phone}</a>
                </td>
                <td className="p-3">{o.products?.name} × {o.quantity}</td>
                <td className="whitespace-nowrap p-3">{Number(o.price) * o.quantity} грн</td>
                <td className="p-3">
                  {o.landings?.title}
                  {o.utm?.utm_source && <div className="text-xs text-neutral-500">{o.utm.utm_source}</div>}
                </td>
                <td className="p-3">
                  <form action={updateOrder} className="flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className={`${inputCls} w-44`}>
                      {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <input name="ttn" defaultValue={o.ttn ?? ''} placeholder="ТТН" className={`${inputCls} w-36`} />
                    <button className={btn2Cls}>Зберегти</button>
                  </form>
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-neutral-500">Замовлень поки немає.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
