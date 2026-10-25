'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { ORDER_STATUSES } from '@/lib/constants'
import { TEMPLATES } from '@/lib/templates'

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim()
const num = (f: FormData, k: string) => {
  const n = Number(str(f, k).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

export async function updateOrder(formData: FormData) {
  await requireAdmin()
  const status = str(formData, 'status')
  if (!ORDER_STATUSES.some((s) => s.value === status)) return
  await supabase
    .from('orders')
    .update({ status, ttn: str(formData, 'ttn').slice(0, 40) || null })
    .eq('id', str(formData, 'id'))
  revalidatePath('/admin/orders')
}

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const name = str(formData, 'name').slice(0, 120)
  if (!name) return
  await supabase.from('products').insert({
    name,
    cost_price: num(formData, 'cost_price'),
    sale_price: num(formData, 'sale_price'),
    supplier: str(formData, 'supplier').slice(0, 120) || null,
  })
  revalidatePath('/admin/products')
}

export async function updateProduct(formData: FormData) {
  await requireAdmin()
  await supabase
    .from('products')
    .update({
      cost_price: num(formData, 'cost_price'),
      sale_price: num(formData, 'sale_price'),
      supplier: str(formData, 'supplier').slice(0, 120) || null,
    })
    .eq('id', str(formData, 'id'))
  revalidatePath('/admin/products')
}

export async function createLanding(formData: FormData) {
  await requireAdmin()
  const title = str(formData, 'title').slice(0, 150)
  const slug = slugify(str(formData, 'slug'))
  const productId = str(formData, 'product_id')
  if (!title || !slug || !productId) redirect('/admin/landings?error=fields')

  let blocks: unknown = []
  let settings: unknown = {}
  const from = str(formData, 'copy_from')
  const builtin = from.startsWith('tpl:') ? TEMPLATES.find((x) => x.key === from.slice(4)) : undefined
  if (builtin) {
    blocks = builtin.build()
  } else if (from) {
    const { data: tpl } = await supabase.from('landings').select('blocks,settings').eq('id', from).maybeSingle()
    if (tpl) { blocks = tpl.blocks; settings = tpl.settings }
  }

  const { error } = await supabase
    .from('landings')
    .insert({ title, slug, product_id: productId, blocks, settings, status: 'draft' })
  if (error) redirect('/admin/landings?error=slug')
  revalidatePath('/admin/landings')
  redirect('/admin/landings')
}

export async function duplicateLanding(formData: FormData) {
  await requireAdmin()
  const { data: l } = await supabase.from('landings').select('*').eq('id', str(formData, 'id')).maybeSingle()
  if (!l) return
  const suffix = Math.random().toString(36).slice(2, 6)
  await supabase.from('landings').insert({
    title: `${l.title} (копія)`,
    slug: `${l.slug}-${suffix}`.slice(0, 60),
    product_id: l.product_id,
    blocks: l.blocks,
    settings: l.settings,
    status: 'draft',
  })
  revalidatePath('/admin/landings')
}

export async function setLandingStatus(formData: FormData) {
  await requireAdmin()
  const status = str(formData, 'status') === 'published' ? 'published' : 'draft'
  const id = str(formData, 'id')
  const { data: l } = await supabase.from('landings').update({ status }).eq('id', id).select('slug').maybeSingle()
  revalidatePath('/admin/landings')
  if (l?.slug) revalidatePath(`/l/${l.slug}`)
}
