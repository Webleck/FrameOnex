import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { addSpend, deleteSpend } from '../../ad-actions'
import { inputCls, btnCls, btn2Cls, cardCls } from '@/lib/ui'

export default async function AdsPage() {
  await requireAdmin()
  const { data: landings } = await supabase.from('landings').select('id,title').order('created_at', { ascending: false })
  const { data: entries } = await supabase
    .from('ad_spend')
    .select('*, landings(title)')
    .order('day', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Витрати на рекламу</h1>

      <form action={addSpend} className={`${cardCls} grid gap-3 sm:grid-cols-4`}>
        <select name="landing_id" required defaultValue="" className={inputCls}>
          <option value="" disabled>Лендінг</option>
          {(landings ?? []).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <input name="day" type="date" required defaultValue={today} className={inputCls} />
        <input name="amount" required inputMode="decimal" placeholder="Сума, грн" className={inputCls} />
        <button className={btnCls}>Додати витрату</button>
      </form>
      <p className="text-sm text-neutral-500">Кілька витрат за один день на один лендінг додаються разом.</p>

      <div className="space-y-2">
        {(entries ?? []).map((e) => (
          <div key={e.id} className={`${cardCls} flex flex-wrap items-center gap-3`}>
            <span className="w-28 text-sm text-neutral-500">{e.day}</span>
            <span className="min-w-0 flex-1 font-medium">{e.landings?.title}</span>
            <span className="font-semibold">{Number(e.amount)} грн</span>
            <form action={deleteSpend}>
              <input type="hidden" name="id" value={e.id} />
              <button className={btn2Cls}>Видалити</button>
            </form>
          </div>
        ))}
        {(entries ?? []).length === 0 && <p className="text-neutral-500">Витрат поки немає.</p>}
      </div>
    </div>
  )
}
