'use client'

export default function SliderInput({ value, onChange, min, max, step = 1, unit = '', def }: {
  value?: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; def: number
}) {
  const v = typeof value === 'number' ? value : def
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : def))
  const box = { width: 72, padding: '6px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 } as const
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(clamp(Number(e.target.value)))} style={{ flex: 1 }} />
        <input type="number" min={min} max={max} step={step} value={v} onChange={(e) => onChange(clamp(Number(e.target.value)))} style={box} />
        {unit && <span style={{ fontSize: 13, opacity: 0.7 }}>{unit}</span>}
      </div>
      <button type="button" onClick={() => onChange(def)} disabled={v === def}
        style={{ justifySelf: 'start', padding: '3px 10px', border: '1px solid #bbb', borderRadius: 6, background: '#fff', fontSize: 13, opacity: v === def ? 0.5 : 1 }}>
        Скинути
      </button>
    </div>
  )
}
