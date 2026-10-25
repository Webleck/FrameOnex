'use client'
import { useState } from 'react'

export default function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function upload(file: File) {
    setBusy(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Помилка завантаження')
      onChange(json.url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Помилка завантаження')
    } finally {
      setBusy(false)
    }
  }

  const box = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 } as const
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 6 }} />
      )}
      <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Посилання https://… або файл нижче" style={box} />
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} style={{ fontSize: 13 }} />
      {busy && <span style={{ fontSize: 13 }}>Завантаження…</span>}
      {err && <span style={{ fontSize: 13, color: '#c00' }}>{err}</span>}
    </div>
  )
}
