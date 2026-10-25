import type { CSSProperties } from 'react'

export const FONTS = {
  sans: { label: 'Системний (сучасний)', stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  serif: { label: 'З засічками', stack: 'Georgia, "Times New Roman", serif' },
  rounded: { label: 'Заокруглений', stack: 'ui-rounded, "Nunito", "Segoe UI", system-ui, sans-serif' },
} as const

export type FontKey = keyof typeof FONTS
export const DEFAULT_ACCENT = '#0E7C66'

export function safeAccent(v: unknown): string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : DEFAULT_ACCENT
}
export function fontKey(v: unknown): FontKey {
  return typeof v === 'string' && Object.keys(FONTS).includes(v) ? (v as FontKey) : 'sans'
}
export const fontStack = (v: unknown) => FONTS[fontKey(v)].stack

export const safeColor = (v: unknown): string | undefined =>
  typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : undefined

// Адреса фонового зображення: лише http(s) або шлях, без символів, що ламають CSS url()
export function safeBgUrl(v: unknown): string {
  if (typeof v !== 'string') return ''
  const x = v.trim().slice(0, 1000)
  if (/[\s"'()\\<>]/.test(x)) return ''
  return /^https?:\/\//i.test(x) || x.startsWith('/') ? x : ''
}

export const OVERLAYS = ['0', '20', '40', '60', '80'] as const
export type Overlay = (typeof OVERLAYS)[number]
export function overlayOf(v: unknown): Overlay {
  return typeof v === 'string' && (OVERLAYS as readonly string[]).includes(v) ? (v as Overlay) : '0'
}
export const darkOverlay = (o?: string) => Number(o ?? 0) >= 40

export function isDarkColor(hex?: string): boolean {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return false
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

// Фон: колір і/або фото із затемненням
export function bgStyle(o: { color?: string; image?: string; overlay?: string }): CSSProperties {
  const st: CSSProperties = {}
  if (o.color) st.backgroundColor = o.color
  if (o.image) {
    const a = Number(o.overlay ?? 0) / 100
    const layers: string[] = []
    if (a > 0) layers.push(`linear-gradient(rgba(0,0,0,${a}),rgba(0,0,0,${a}))`)
    layers.push(`url("${o.image}")`)
    st.backgroundImage = layers.join(', ')
    st.backgroundSize = 'cover'
    st.backgroundPosition = 'center'
  }
  return st
}
