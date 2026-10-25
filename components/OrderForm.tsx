'use client'
import { useState } from 'react'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

export default function OrderForm({ landingId, price, cta, inverted = false }: { landingId: string; price: number; cta: string; inverted?: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    UTM_KEYS.forEach((k) => { const v = params.get(k); if (v) utm[k] = v })
    setState('sending'); setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_id: landingId,
          name: fd.get('name'),
          phone: fd.get('phone'),
          quantity: Number(fd.get('quantity')),
          website: fd.get('website'),
          utm,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Не вдалося надіслати')
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося надіслати')
      setState('idle')
    }
  }

  if (state === 'done') {
    return <p className="rounded-xl bg-white p-6 text-lg font-medium text-neutral-900">Дякуємо! Ми зателефонуємо вам найближчим часом для підтвердження.</p>
  }

  const input = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30'
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="name" required minLength={2} placeholder="Ваше імʼя" autoComplete="name" className={input} />
      <input name="phone" required type="tel" placeholder="Телефон, 0XX XXX XX XX" autoComplete="tel" className={input} />
      <select name="quantity" defaultValue="1" className={input}>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} шт. — {price * n} грн</option>)}
      </select>
      {/* honeypot для ботів */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={state === 'sending'} className={`w-full rounded-xl px-6 py-4 text-lg font-semibold disabled:opacity-60 ${inverted ? 'bg-white text-[var(--accent)]' : 'bg-[var(--accent)] text-[var(--on-accent,#fff)]'}`}>
        {state === 'sending' ? 'Надсилаємо…' : cta}
      </button>
      <p className="text-center text-sm opacity-70">Оплата при отриманні. Ціна: {price} грн за шт.</p>
    </form>
  )
}
