'use client'
import { useEffect, useState } from 'react'

function parts(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000))
  return { 'дн': Math.floor(t / 86400), 'год': Math.floor((t % 86400) / 3600), 'хв': Math.floor((t % 3600) / 60), 'сек': t % 60 }
}

// Зворотний відлік до реальної дати завершення акції
export default function Timer({ endsAt, expiredText, onDark, center }: { endsAt: string; expiredText: string; onDark: boolean; center: boolean }) {
  const end = new Date(endsAt).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  if (!Number.isFinite(end)) return <p className="opacity-70">Вкажіть дату завершення акції.</p>
  if (now === null) return <div className="h-20" />
  if (end - now <= 0) return <p className="text-lg font-semibold">{expiredText}</p>

  const box = onDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
  return (
    <div className={`flex gap-3 ${center ? 'justify-center' : ''}`}>
      {Object.entries(parts(end - now)).map(([label, v]) => (
        <div key={label} className={`min-w-16 rounded-xl px-3 py-3 text-center ${box}`}>
          <div className="text-2xl font-bold tabular-nums sm:text-3xl">{String(v).padStart(2, '0')}</div>
          <div className="text-xs opacity-70">{label}</div>
        </div>
      ))}
    </div>
  )
}
