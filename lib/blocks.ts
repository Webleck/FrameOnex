import { safeAccent, fontKey, safeColor, safeBgUrl, overlayOf } from './theme'

export type BlockStyle = {
  bg?: 'none' | 'light' | 'accent' | 'dark'
  space?: 'compact' | 'normal' | 'spacious'
  align?: 'left' | 'center'
  show?: 'all' | 'mobile' | 'desktop'
  bgColor?: string
  textColor?: string
  btnColor?: string
  btnText?: string
  bgImage?: string
  overlay?: string
  widthPct?: number
  hAlign?: 'left' | 'center' | 'right'
  minH?: number
  vAlign?: 'top' | 'center' | 'bottom'
  pos?: { x: number; y: number }
  z?: number
  posMobile?: 'desktop' | 'all'
}

type Base = { style?: BlockStyle }
export type Block = Base &
  (
    | {
        type: 'hero'; headline: string; subheadline: string; image: string; cta: string
        imageLayout?: 'right' | 'left' | 'top' | 'full'
        imageRatio?: 'auto' | 'square' | '4-3' | '16-9' | '21-9'
      }
    | {
        type: 'image'; image: string; alt: string; caption: string
        width: 'page' | 'full'; ratio: 'auto' | 'square' | '4-3' | '16-9' | '21-9'
        fit: 'cover' | 'contain'; rounded: 'yes' | 'no'
      }
    | { type: 'benefits'; title: string; items: { title: string; text: string }[] }
    | { type: 'reviews'; title: string; items: { name: string; text: string }[] }
    | { type: 'faq'; title: string; items: { q: string; a: string }[] }
    | { type: 'order'; title: string; cta: string }
    | { type: 'timer'; title: string; text: string; endsAt: string; expiredText: string }
    | { type: 'gallery'; title: string; columns: '2' | '3'; items: { image: string }[] }
    | { type: 'video'; title: string; url: string }
    | { type: 'comparison'; title: string; ourLabel: string; otherLabel: string; rows: { feature: string; ours: 'yes' | 'no'; other: 'yes' | 'no' }[] }
    | { type: 'text'; title: string; body: string }
    | { type: 'cta'; title: string; cta: string }
    | {
        type: 'columns'
        layout: '1' | '2' | '3' | '1-2' | '2-1'
        gap: 'small' | 'normal' | 'large'
        valign: 'start' | 'center'
        col1: Block[]
        col2: Block[]
        col3: Block[]
      }
  )

type Obj = Record<string, unknown>

const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '')
const url = (v: unknown) => {
  const x = s(v, 1000).trim()
  return /^https?:\/\//i.test(x) || x.startsWith('/') ? x : ''
}
const list = (v: unknown, n: number): Obj[] =>
  Array.isArray(v) ? v.slice(0, n).map((x) => (x && typeof x === 'object' ? (x as Obj) : {})) : []
const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined

const RATIOS = ['auto', 'square', '4-3', '16-9', '21-9'] as const

const num = (v: unknown, min: number, max: number): number | undefined => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined
}

function sanitizeStyle(raw: unknown): BlockStyle {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Obj
  const st: BlockStyle = {}
  const bg = pick(o.bg, ['none', 'light', 'accent', 'dark'] as const)
  const space = pick(o.space, ['compact', 'normal', 'spacious'] as const)
  const align = pick(o.align, ['left', 'center'] as const)
  const show = pick(o.show, ['all', 'mobile', 'desktop'] as const)
  if (bg) st.bg = bg
  if (space) st.space = space
  if (align) st.align = align
  if (show) st.show = show
  const bgColor = safeColor(o.bgColor)
  const textColor = safeColor(o.textColor)
  const btnColor = safeColor(o.btnColor)
  const btnText = safeColor(o.btnText)
  const bgImage = safeBgUrl(o.bgImage)
  if (bgColor) st.bgColor = bgColor
  if (textColor) st.textColor = textColor
  if (btnColor) st.btnColor = btnColor
  if (btnText) st.btnText = btnText
  if (bgImage) { st.bgImage = bgImage; st.overlay = overlayOf(o.overlay) }
  const widthPct = num(o.widthPct, 20, 100)
  const hAlign = pick(o.hAlign, ['left', 'center', 'right'] as const)
  const minH = num(o.minH, 0, 1500)
  const vAlign = pick(o.vAlign, ['top', 'center', 'bottom'] as const)
  const posRaw = (o.pos && typeof o.pos === 'object' ? o.pos : {}) as Obj
  const px = num(posRaw.x, -600, 600) ?? 0
  const py = num(posRaw.y, -600, 600) ?? 0
  const z = num(o.z, -5, 50)
  const posMobile = pick(o.posMobile, ['desktop', 'all'] as const)
  if (widthPct && widthPct < 100) st.widthPct = widthPct
  if (hAlign) st.hAlign = hAlign
  if (minH && minH > 0) st.minH = minH
  if (vAlign) st.vAlign = vAlign
  if (px || py) st.pos = { x: px, y: py }
  if (z) st.z = z
  if (posMobile) st.posMobile = posMobile
  return st
}

// Очищає дані з редактора перед збереженням у базу
export function sanitizeBlocks(input: unknown, depth = 0): Block[] {
  const out: Block[] = []
  for (const b of list(input, 40)) {
    const style = sanitizeStyle(b.style)
    switch (b.type) {
      case 'hero':
        out.push({
          type: 'hero', headline: s(b.headline, 200), subheadline: s(b.subheadline, 500), image: url(b.image), cta: s(b.cta, 60),
          imageLayout: pick(b.imageLayout, ['right', 'left', 'top', 'full'] as const) ?? 'right',
          imageRatio: pick(b.imageRatio, RATIOS) ?? 'square',
          style,
        })
        break
      case 'benefits':
        out.push({ type: 'benefits', title: s(b.title, 150), items: list(b.items, 12).map((i) => ({ title: s(i.title, 120), text: s(i.text, 400) })), style })
        break
      case 'reviews':
        out.push({ type: 'reviews', title: s(b.title, 150), items: list(b.items, 20).map((i) => ({ name: s(i.name, 120), text: s(i.text, 600) })), style })
        break
      case 'faq':
        out.push({ type: 'faq', title: s(b.title, 150), items: list(b.items, 20).map((i) => ({ q: s(i.q, 200), a: s(i.a, 800) })), style })
        break
      case 'image':
        out.push({
          type: 'image', image: url(b.image), alt: s(b.alt, 200), caption: s(b.caption, 300),
          width: b.width === 'full' ? 'full' : 'page', ratio: pick(b.ratio, RATIOS) ?? 'auto',
          fit: b.fit === 'contain' ? 'contain' : 'cover', rounded: b.rounded === 'no' ? 'no' : 'yes', style,
        })
        break
      case 'columns': {
        if (depth >= 1) break // колонки в колонках не підтримуємо
        out.push({
          type: 'columns',
          layout: pick(b.layout, ['1', '2', '3', '1-2', '2-1'] as const) ?? '2',
          gap: pick(b.gap, ['small', 'normal', 'large'] as const) ?? 'normal',
          valign: pick(b.valign, ['start', 'center'] as const) ?? 'start',
          col1: sanitizeBlocks(b.col1, depth + 1),
          col2: sanitizeBlocks(b.col2, depth + 1),
          col3: sanitizeBlocks(b.col3, depth + 1),
          style,
        })
        break
      }
      case 'timer': {
        const ends = s(b.endsAt, 40)
        out.push({ type: 'timer', title: s(b.title, 150), text: s(b.text, 300), endsAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(ends) ? ends.slice(0, 16) : '', expiredText: s(b.expiredText, 120), style })
        break
      }
      case 'gallery':
        out.push({
          type: 'gallery', title: s(b.title, 150), columns: b.columns === '3' ? '3' : '2',
          items: list(b.items, 12).map((i) => ({ image: url(i.image) })).filter((i) => i.image), style,
        })
        break
      case 'video': {
        const u = s(b.url, 500).trim()
        out.push({ type: 'video', title: s(b.title, 150), url: videoEmbed(u) ? u : '', style })
        break
      }
      case 'comparison':
        out.push({
          type: 'comparison', title: s(b.title, 150), ourLabel: s(b.ourLabel, 40), otherLabel: s(b.otherLabel, 40),
          rows: list(b.rows, 15).map((r) => ({ feature: s(r.feature, 150), ours: r.ours === 'no' ? 'no' : 'yes', other: r.other === 'yes' ? 'yes' : 'no' })), style,
        })
        break
      case 'text':
        out.push({ type: 'text', title: s(b.title, 150), body: s(b.body, 3000), style })
        break
      case 'cta':
        out.push({ type: 'cta', title: s(b.title, 150), cta: s(b.cta, 60), style })
        break
      case 'order':
        out.push({ type: 'order', title: s(b.title, 150), cta: s(b.cta, 60), style })
        break
    }
  }
  return out
}

export type PageSettings = {
  accent: string; font: string
  bgColor: string; textColor: string; bgImage: string; overlay: string; popup: string
}

// Налаштування сторінки (колір, шрифт, фон) з даних Puck
export function rootSettings(data: unknown): PageSettings {
  const p = ((data as { root?: { props?: Obj } } | null)?.root?.props ?? {}) as Obj
  const bgImage = safeBgUrl(p.bgImage)
  return {
    accent: safeAccent(p.accent),
    font: fontKey(p.font),
    bgColor: safeColor(p.bgColor) ?? '',
    textColor: safeColor(p.textColor) ?? '',
    bgImage,
    overlay: bgImage ? overlayOf(p.overlay) : '0',
    popup: p.popup === 'off' ? 'off' : 'on',
  }
}

const SLOTS = ['col1', 'col2', 'col3'] as const
type PuckItem = { type: string; props: Record<string, unknown> }

function toItem(b: Block, id: string): PuckItem {
  const { type, ...rest } = b
  const props: Record<string, unknown> = { ...rest, id }
  if (b.type === 'columns') {
    for (const k of SLOTS) props[k] = b[k].map((c, i) => toItem(c, `${id}-${k}-${i}`))
  }
  return { type, props }
}

// База -> редактор Puck
export function toPuckData(blocks: Block[], settings?: Partial<PageSettings> | null) {
  return {
    root: {
      props: {
        accent: safeAccent(settings?.accent),
        font: fontKey(settings?.font),
        bgColor: safeColor(settings?.bgColor) ?? '',
        textColor: safeColor(settings?.textColor) ?? '',
        bgImage: safeBgUrl(settings?.bgImage),
        overlay: overlayOf(settings?.overlay),
        popup: settings?.popup === 'off' ? 'off' : 'on',
      },
    },
    content: blocks.map((b, i) => toItem(b, `${b.type}-${i}`)),
  }
}

function fromItem(c: unknown): Obj {
  const o = (c && typeof c === 'object' ? c : {}) as { type?: unknown; props?: Obj }
  const props: Obj = { ...(o.props ?? {}) }
  for (const k of SLOTS) {
    if (Array.isArray(props[k])) props[k] = (props[k] as unknown[]).map(fromItem)
  }
  return { type: o.type, ...props }
}

// Редактор Puck -> база
export function fromPuckData(data: unknown): Block[] {
  const content = (data as { content?: unknown } | null)?.content
  return sanitizeBlocks((Array.isArray(content) ? content : []).map(fromItem))
}

// Розпізнає посилання на відео: YouTube, Vimeo або прямий файл .mp4/.webm
export function videoEmbed(raw: string): { kind: 'iframe' | 'file'; src: string } | null {
  const yt = raw.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` }
  const vm = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` }
  if (/^https:\/\/[^\s]+\.(mp4|webm)(\?[^\s]*)?$/i.test(raw)) return { kind: 'file', src: raw }
  return null
}

// Дата через n днів у форматі поля datetime-local
export function inDays(n: number): string {
  const d = new Date(Date.now() + n * 86400000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
