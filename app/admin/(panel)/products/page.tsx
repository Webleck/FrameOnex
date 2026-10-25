import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { createProduct, updateProduct } from '../../actions'
import { inputCls, btnCls, btn2Cls, cardCls } from '@/lib/ui'

export default async function ProductsPage() {
  await requireAdmin()
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Товари</h1>

      <form action={createProduct} className={`${cardCls} grid gap-3 sm:grid-cols-5`}>
        <input name="name" required placeholder="Назва товару" className={`${inputCls} sm:col-span-2`} />
        <input name="cost_price" inputMode="decimal" placeholder="Закупівля, грн" className={inputCls} />
        <input name="sale_price" inputMode="decimal" placeholder="Продаж, грн" className={inputCls} />
        <input name="supplier" placeholder="Постачальник" className={inputCls} />
        <button className={`${btnCls} sm:col-span-5 sm:w-fit`}>Додати товар</button>
      </form>

      <div className="space-y-2">
        {(products ?? []).map((p) => (
          <form key={p.id} action={updateProduct} className={`${cardCls} grid items-center gap-3 sm:grid-cols-5`}>
            <input type="hidden" name="id" value={p.id} />
            <div className="font-medium sm:col-span-1">{p.name}</div>
            <input name="cost_price" defaultValue={p.cost_price} inputMode="decimal" className={inputCls} />
            <input name="sale_price" defaultValue={p.sale_price} inputMode="decimal" className={inputCls} />
            <input name="supplier" defaultValue={p.supplier ?? ''} className={inputCls} />
            <button className={btn2Cls}>Зберегти</button>
          </form>
        ))}
        {(products ?? []).length === 0 && <p className="text-neutral-500">Товарів поки немає.</p>}
      </div>
      <p className="text-sm text-neutral-500">Колонки: закупівельна ціна, ціна продажу, постачальник. Нові замовлення беруть ціни звідси.</p>
    </div>
  )
}
