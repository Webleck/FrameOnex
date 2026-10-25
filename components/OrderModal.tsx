'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import OrderForm from './OrderForm'

const ModalCtx = createContext<{ open: () => void } | null>(null)

// Вікно замовлення: відкривається з кнопок «Замовити». Форма внизу сторінки лишається.
export function OrderModalProvider({
  landingId, price, productName, cta, enabled, accent, fontFamily, children,
}: {
  landingId: string; price: number; productName: string; cta: string
  enabled: boolean; accent: string; fontFamily: string; children: React.ReactNode
}) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const value = useMemo(() => (enabled ? { open } : null), [enabled, open])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen])

  return (
    <ModalCtx.Provider value={value}>
      {children}
      {enabled && isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          style={{ '--accent': accent, fontFamily } as React.CSSProperties}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Оформлення замовлення"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 text-neutral-900 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Оформити замовлення</h2>
                <p className="text-sm text-neutral-500">{productName}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрити"
                className="text-3xl leading-none text-neutral-500 hover:text-neutral-900">×</button>
            </div>
            <OrderForm landingId={landingId} price={price} cta={cta} />
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  )
}

// Кнопка «Замовити»: відкриває вікно; без вікна (або в редакторі) веде до форми внизу
export function OrderButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = useContext(ModalCtx)
  if (!ctx) return <a href="#order" className={className}>{children}</a>
  return <button type="button" onClick={ctx.open} className={`cursor-pointer ${className ?? ''}`}>{children}</button>
}
