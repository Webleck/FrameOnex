'use client'

const PRESETS = ['#0E7C66', '#1F6FEB', '#D92D20', '#E8590C', '#7C3AED', '#111827', '#FFFFFF']

export default function ColorInput({ value, onChange, allowEmpty = false }: { value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  const has = Boolean(value)
  const v = value || '#0E7C66'
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PRESETS.map((c) => (
          <button key={c} type="button" onClick={() => onChange(c)} aria-label={c}
            style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
              border: has && v.toLowerCase() === c.toLowerCase() ? '3px solid #111' : '1px solid #bbb' }} />
        ))}
      </div>
      <input type="color" value={v} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', height: 36 }} />
      {allowEmpty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <button type="button" onClick={() => onChange('')} disabled={!has}
            style={{ padding: '4px 10px', border: '1px solid #bbb', borderRadius: 6, background: '#fff', cursor: has ? 'pointer' : 'default', opacity: has ? 1 : 0.5 }}>
            Скинути колір
          </button>
          {!has && <span style={{ opacity: 0.7 }}>Не задано (стандартний)</span>}
        </div>
      )}
    </div>
  )
}
