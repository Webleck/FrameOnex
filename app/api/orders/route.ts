import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 })
  if (body.website) return NextResponse.json({ ok: true }) // бот: ігноруємо мовчки

  const name = String(body.name ?? '').trim().slice(0, 100)
  const phone = String(body.phone ?? '').replace(/[^\d+]/g, '').slice(0, 20)
  const digits = phone.replace(/\D/g, '').length
  const quantity = Math.min(Math.max(parseInt(body.quantity) || 1, 1), 10)
  if (name.length < 2 || digits < 10 || digits > 15) {
    return NextResponse.json({ error: 'Перевірте імʼя та номер телефону' }, { status: 400 })
  }

  const utm: Record<string, string> = {}
  for (const k of UTM_KEYS) {
    const v = body.utm?.[k]
    if (typeof v === 'string') utm[k] = v.slice(0, 100)
  }

  const { data: landing } = await supabase
    .from('landings').select('id,title,product_id').eq('id', body.landing_id).eq('status', 'published').maybeSingle()
  if (!landing) return NextResponse.json({ error: 'Лендінг не знайдено' }, { status: 404 })

  // Ціну беремо з бази, а не з браузера
  const { data: product } = await supabase.from('products').select('*').eq('id', landing.product_id).single()
  if (!product) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 })

  const { error } = await supabase.from('orders').insert({
    landing_id: landing.id,
    product_id: product.id,
    customer_name: name,
    phone,
    quantity,
    price: product.sale_price,
    cost_price: product.cost_price,
    utm,
  })
  if (error) return NextResponse.json({ error: 'Не вдалося зберегти замовлення' }, { status: 500 })

  await sendTelegram(
    `Нове замовлення\n${product.name} × ${quantity} = ${Number(product.sale_price) * quantity} грн\n${name}\n${phone}\nЛендінг: ${landing.title}` +
      (utm.utm_source ? `\nДжерело: ${utm.utm_source}` : '')
  ).catch(() => {})

  return NextResponse.json({ ok: true })
}
