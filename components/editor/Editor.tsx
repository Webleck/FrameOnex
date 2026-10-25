'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Puck } from '@puckeditor/core'
import type { Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { makeConfig } from './puck-config'
import { saveDraft, publishLanding } from '@/app/admin/editor-actions'
import { fromPuckData, rootSettings } from '@/lib/blocks'

type Props = { landingId: string; title: string; slug: string; price: number; initialData: unknown; hasDraft: boolean }

const snapshot = (data: unknown) => JSON.stringify([fromPuckData(data), rootSettings(data)])

export default function Editor({ landingId, title, slug, price, initialData, hasDraft }: Props) {
  const config = useMemo(() => makeConfig(price), [price])
  const [status, setStatus] = useState(hasDraft ? 'Відновлено чернетку' : 'Збережено')
  const last = useRef<string>(snapshot(initialData))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function onChange(data: Data) {
    const snap = snapshot(data)
    if (snap === last.current) return
    last.current = snap
    setStatus('Зберігаємо чернетку…')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const r = await saveDraft(landingId, data)
      setStatus(r.ok ? 'Чернетка збережена' : r.error ?? 'Помилка збереження')
    }, 1500)
  }

  return (
    <Puck
      config={config}
      data={initialData as Data}
      headerTitle={title}
      headerPath={`/l/${slug}`}
      onChange={onChange}
      onPublish={async (data) => {
        if (timer.current) clearTimeout(timer.current)
        const r = await publishLanding(landingId, data)
        last.current = snapshot(data)
        setStatus(r.ok ? 'Опубліковано' : r.error ?? 'Помилка публікації')
        alert(r.ok ? 'Опубліковано. Зміни на сайті зʼявляться протягом хвилини.' : r.error ?? 'Помилка публікації')
      }}
      overrides={{
        headerActions: ({ children }) => (
          <>
            <a href="/admin/landings" style={{ fontSize: 14, marginRight: 12 }}>← До лендінгів</a>
            <span style={{ fontSize: 13, opacity: 0.7, marginRight: 12 }}>{status}</span>
            {children}
          </>
        ),
      }}
    />
  )
}
