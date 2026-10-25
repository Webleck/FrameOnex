import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { createLanding, duplicateLanding, setLandingStatus } from '../../actions'
import { inputCls, btnCls, btn2Cls, cardCls } from '@/lib/ui'
import { TEMPLATES } from '@/lib/templates'

export default async function LandingsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin()
  const { error } = await searchParams
  const { data: landings } = await supabase
    .from('landings').select('*, products(name)').order('created_at', { ascending: false })
  const { data: products } = await supabase.from('products').select('id,name').order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Лендінги</h1>

      <form action={createLanding} className={`${cardCls} grid gap-3 sm:grid-cols-2`}>
        <h2 className="font-semibold sm:col-span-2">Новий лендінг</h2>
        <input name="title" required placeholder="Заголовок сторінки" className={inputCls} />
        <input name="slug" required placeholder="Адреса: латиницею, напр. kofemolka" className={inputCls} />
        <select name="product_id" required className={inputCls} defaultValue="">
          <option value="" disabled>Оберіть товар</option>
          {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select name="copy_from" className={inputCls} defaultValue="">
          <option value="">Порожній лендінг</option>
          <optgroup label="Готові шаблони">
            {TEMPLATES.map((tp) => <option key={tp.key} value={`tpl:${tp.key}`}>{tp.label}</option>)}
          </optgroup>
          <optgroup label="Копіювати існуючий лендінг">
            {(landings ?? []).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </optgroup>
        </select>
        {error === 'slug' && <p className="text-sm text-red-600 sm:col-span-2">Така адреса вже існує, оберіть іншу.</p>}
        {error === 'fields' && <p className="text-sm text-red-600 sm:col-span-2">Заповніть усі поля.</p>}
        <button className={`${btnCls} sm:w-fit`}>Створити чернетку</button>
      </form>

      <div className="space-y-2">
        {(landings ?? []).map((l) => (
          <div key={l.id} className={`${cardCls} flex flex-wrap items-center gap-3`}>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{l.title}</div>
              <div className="text-sm text-neutral-500">
                {l.products?.name} ·{' '}
                <a href={`/l/${l.slug}`} target="_blank" className="text-teal-700">/l/{l.slug}</a>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${l.status === 'published' ? 'bg-teal-100 text-teal-800' : 'bg-neutral-200 text-neutral-700'}`}>
              {l.status === 'published' ? 'Опубліковано' : 'Чернетка'}
            </span>
            {l.draft && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Є чернетка</span>}
            <form action={setLandingStatus}>
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="status" value={l.status === 'published' ? 'draft' : 'published'} />
              <button className={btn2Cls}>{l.status === 'published' ? 'Зняти з публікації' : 'Опублікувати'}</button>
            </form>
            <a href={`/admin/editor/${l.id}`} className={btn2Cls}>Редагувати</a>
            <form action={duplicateLanding}>
              <input type="hidden" name="id" value={l.id} />
              <button className={btn2Cls}>Дублювати</button>
            </form>
          </div>
        ))}
        {(landings ?? []).length === 0 && <p className="text-neutral-500">Лендінгів поки немає.</p>}
      </div>
    </div>
  )
}
