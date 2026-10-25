'use client'
import { useRef } from 'react'

type Pos = { x: number; y: number }
const RANGE = 300 // діапазон «планшета» у пікселях в обидва боки

export default function PositionPad({ value, onChange }: { value?: Pos; onChange: (v: Pos) => void }) {
  const pos: Pos = { x: value?.x ?? 0, y: value?.y ?? 0 }
  const ref = useRef<HTMLDivElement>(null)
  const clamp = (n: number) => Math.min(600, Math.max(-600, Math.round(Number.isFinite(n) ? n : 0)))

  function fromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const nx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const ny = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    onChange({ x: Math.round((nx * 2 - 1) * RANGE), y: Math.round((ny * 2 - 1) * RANGE) })
  }

  const dotX = Math.min(100, Math.max(0, ((pos.x / RANGE + 1) / 2) * 100))
  const dotY = Math.min(100, Math.max(0, ((pos.y / RANGE + 1) / 2) * 100))
  const box = { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 } as const

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        ref={ref}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e) }}
        onPointerMove={(e) => { if (e.buttons === 1) fromEvent(e) }}
        style={{
          position: 'relative', height: 150, border: '1px solid #bbb', borderRadius: 8, touchAction: 'none', cursor: 'crosshair',
          background: 'linear-gradient(#0001 1px, transparent 1px) 0 50% / 100% 100% no-repeat, linear-gradient(90deg, #0001 1px, transparent 1px) 50% 0 / 100% 100% no-repeat, #fafafa',
        }}
      >
        <div style={{ position: 'absolute', left: `${dotX}%`, top: `${dotY}%`, width: 16, height: 16, borderRadius: '50%', background: '#0E7C66', border: '2px solid #fff', boxShadow: '0 0 0 1px #0E7C66', transform: 'translate(-50%, -50%)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
        <label>Вправо / вліво, px
          <input type="number" value={pos.x} onChange={(e) => onChange({ ...pos, x: clamp(Number(e.target.value)) })} style={box} />
        </label>
        <label>Вниз / вгору, px
          <input type="number" value={pos.y} onChange={(e) => onChange({ ...pos, y: clamp(Number(e.target.value)) })} style={box} />
        </label>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Мінусове значення «вгору» підтягує блок на попередній. Центр = без зсуву.</div>
      <button type="button" onClick={() => onChange({ x: 0, y: 0 })} disabled={!pos.x && !pos.y}
        style={{ justifySelf: 'start', padding: '3px 10px', border: '1px solid #bbb', borderRadius: 6, background: '#fff', fontSize: 13, opacity: pos.x || pos.y ? 1 : 0.5 }}>
        Скинути зсув
      </button>
    </div>
  )
}
