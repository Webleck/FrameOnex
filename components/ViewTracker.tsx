'use client'
import { useEffect } from 'react'

// Рахує перегляд один раз за сесію браузера
export default function ViewTracker({ landingId }: { landingId: string }) {
  useEffect(() => {
    try {
      const key = `v:${landingId}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {}
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landing_id: landingId }),
      keepalive: true,
    }).catch(() => {})
  }, [landingId])
  return null
}
