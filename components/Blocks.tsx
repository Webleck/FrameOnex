import type { Block, BlockStyle } from '@/lib/blocks'
import { bgStyle, darkOverlay, isDarkColor } from '@/lib/theme'
import OrderForm from './OrderForm'
import Timer from './Timer'
import { OrderButton } from './OrderModal'
import { videoEmbed } from '@/lib/blocks'

type Ctx = { landingId: string; price: number; preview?: boolean; nested?: boolean }

const WRAP = 'mx-auto w-full max-w-3xl px-5'
const h2 = 'mb-6 text-2xl font-bold sm:text-3xl'

const BG = {
  none: '',
  light: 'bg-neutral-100',
  accent: 'bg-[var(--accent)] text-white',
  dark: 'bg-neutral-900 text-white',
}
const PY = { compact: 'py-6', normal: 'py-10', spacious: 'py-16' }
const SHOW = { all: '', mobile: 'sm:hidden', desktop: 'hidden sm:block' }
const RATIO: Record<string, string> = {
  auto: 'h-auto', square: 'aspect-square', '4-3': 'aspect-[4/3]', '16-9': 'aspect-video', '21-9': 'aspect-[21/9]',
}

export const colCount = (layout: string) => (layout === '3' ? 3 : layout === '1' ? 1 : 2)
const COLS: Record<string, string> = {
  '1': '', '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3', '1-2': 'sm:grid-cols-[1fr_2fr]', '2-1': 'sm:grid-cols-[2fr_1fr]',
}
const GAPS: Record<string, string> = { small: 'gap-3', normal: 'gap-6', large: 'gap-10' }

export function ColumnsLayout({ layout, gap, valign, nested, children }: {
  layout: string; gap: string; valign: string; nested?: boolean; children: React.ReactNode
}) {
  return (
    <section className={`${nested ? 'w-full' : WRAP} grid grid-cols-1 ${COLS[layout] ?? COLS['2']} ${GAPS[gap] ?? GAPS.normal} ${valign === 'center' ? 'items-center' : 'items-start'}`}>
      {children}
    </section>
  )
}

function Inner({ block, ctx, onAccent, onDark, center }: { block: Block; ctx: Ctx; onAccent: boolean; onDark: boolean; center: boolean }) {
  const btn = onAccent ? 'bg-white text-[var(--accent)]' : 'bg-[var(--accent)] text-[var(--on-accent,#fff)]'
  const wrap = ctx.nested ? 'w-full' : WRAP
  switch (block.type) {
    case 'hero': {
      const layout = block.imageLayout ?? 'right'
      const sideBySide = (layout === 'right' || layout === 'left') && !ctx.nested
      const img = block.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.image}
          alt=""
          className={`w-full object-cover ${RATIO[block.imageRatio ?? 'square']} ${layout === 'full' && !ctx.nested ? '' : 'rounded-2xl'} ${layout === 'right' && sideBySide ? 'sm:order-2' : ''}`}
        />
      ) : null
      const text = (
        <div className={img && sideBySide ? '' : 'sm:col-span-2'}>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{block.headline}</h1>
          <p className="mt-3 text-lg opacity-75">{block.subheadline}</p>
          <p className="mt-4 text-3xl font-bold">{ctx.price} грн</p>
          <OrderButton className={`mt-5 inline-block rounded-xl px-8 py-4 text-lg font-semibold ${btn}`}>{block.cta}</OrderButton>
        </div>
      )
      if (layout === 'full' && img && !ctx.nested) {
        return (
          <section className="w-full">
            {img}
            <div className={`${wrap} pt-6`}>{text}</div>
          </section>
        )
      }
      return (
        <section className={`${wrap} grid gap-6 ${sideBySide ? 'sm:grid-cols-2 sm:items-center' : ''}`}>
          {img}
          {text}
        </section>
      )
    }
    case 'benefits':
      return (
        <section className={wrap}>
          <h2 className={h2}>{block.title}</h2>
          <ul className={`grid gap-4 ${ctx.nested ? '' : 'sm:grid-cols-3'}`}>
            {block.items.map((i, k) => (
              <li key={k} className={`${center ? 'border-t-4 pt-3' : 'border-l-4 pl-4'} ${onAccent ? 'border-white' : 'border-[var(--accent)]'}`}>
                <h3 className="font-semibold">{i.title}</h3>
                <p className="mt-1 opacity-75">{i.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )
    case 'reviews':
      return (
        <section className={wrap}>
          <h2 className={h2}>{block.title}</h2>
          <div className={`grid gap-4 ${ctx.nested ? '' : 'sm:grid-cols-2'}`}>
            {block.items.map((i, k) => (
              <blockquote key={k} className="rounded-xl bg-white p-5 text-left text-neutral-900">
                <p>{i.text}</p>
                <footer className="mt-3 text-sm font-medium text-neutral-500">{i.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )
    case 'faq':
      return (
        <section className={wrap}>
          <h2 className={h2}>{block.title}</h2>
          <div className="divide-y divide-neutral-200 rounded-xl bg-white text-left text-neutral-900">
            {block.items.map((i, k) => (
              <details key={k} className="group p-4">
                <summary className="cursor-pointer font-medium">{i.q}</summary>
                <p className="mt-2 text-neutral-600">{i.a}</p>
              </details>
            ))}
          </div>
        </section>
      )
    case 'timer':
      return (
        <section className={wrap}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          {block.text && <p className="-mt-3 mb-5 opacity-75">{block.text}</p>}
          <Timer endsAt={block.endsAt} expiredText={block.expiredText} onDark={onDark} center={center} />
        </section>
      )
    case 'gallery':
      return (
        <section className={wrap}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          <div className={`grid gap-3 ${block.columns === '3' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {block.items.filter((i) => i.image).map((i, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={i.image} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
          {ctx.preview && block.items.every((i) => !i.image) && <p className="opacity-70">Додайте картинки в панелі праворуч.</p>}
        </section>
      )
    case 'video': {
      const v = videoEmbed(block.url)
      if (!v) {
        return ctx.preview ? (
          <section className={wrap}><p className="opacity-70">Вставте посилання на YouTube, Vimeo або файл .mp4.</p></section>
        ) : null
      }
      return (
        <section className={wrap}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          {v.kind === 'iframe' ? (
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe src={v.src} title={block.title || 'Відео'} loading="lazy" allowFullScreen className="h-full w-full" />
            </div>
          ) : (
            <video src={v.src} controls playsInline preload="metadata" className="w-full rounded-2xl" />
          )}
        </section>
      )
    }
    case 'comparison':
      return (
        <section className={wrap}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          <div className="overflow-hidden rounded-xl bg-white text-left text-neutral-900">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="p-3" />
                  <th className="p-3 text-center font-semibold text-[var(--accent)]">{block.ourLabel}</th>
                  <th className="p-3 text-center font-semibold text-neutral-500">{block.otherLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {block.rows.map((r, k) => (
                  <tr key={k}>
                    <td className="p-3">{r.feature}</td>
                    <td className="p-3 text-center text-lg font-bold">{r.ours === 'yes' ? <span className="text-green-600">✓</span> : <span className="text-red-500">✕</span>}</td>
                    <td className="p-3 text-center text-lg font-bold">{r.other === 'yes' ? <span className="text-green-600">✓</span> : <span className="text-red-500">✕</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )
    case 'text':
      return (
        <section className={wrap}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          {block.body.split(/\n+/).filter(Boolean).map((p, k) => (
            <p key={k} className="mb-3 text-lg leading-relaxed">{p}</p>
          ))}
        </section>
      )
    case 'cta':
      return (
        <section className={`${wrap} text-center`}>
          {block.title && <h2 className={h2}>{block.title}</h2>}
          <OrderButton className={`inline-block rounded-xl px-8 py-4 text-lg font-semibold ${btn}`}>{block.cta}</OrderButton>
        </section>
      )
    case 'image': {
      if (!block.image) {
        return ctx.preview ? (
          <section className={wrap}><p className="opacity-70">Додайте картинку в панелі праворуч.</p></section>
        ) : null
      }
      const full = block.width === 'full' && !ctx.nested
      return (
        <figure className={full ? 'w-full' : wrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.image}
            alt={block.alt}
            loading="lazy"
            className={`w-full ${block.fit === 'contain' ? 'object-contain' : 'object-cover'} ${RATIO[block.ratio] ?? 'h-auto'} ${!full && block.rounded !== 'no' ? 'rounded-2xl' : ''}`}
          />
          {block.caption && <figcaption className="mt-2 px-5 text-center text-sm opacity-70">{block.caption}</figcaption>}
        </figure>
      )
    }
    case 'columns':
      return (
        <ColumnsLayout layout={block.layout} gap={block.gap} valign={block.valign} nested={ctx.nested}>
          {[block.col1, block.col2, block.col3].slice(0, colCount(block.layout)).map((col, i) => (
            <div key={i} className="min-w-0">
              {col.map((b, j) => <BlockView key={j} block={b} ctx={{ ...ctx, nested: true }} />)}
            </div>
          ))}
        </ColumnsLayout>
      )
    case 'order':
      return (
        <section id="order" className={`${wrap} scroll-mt-4`}>
          <h2 className={h2}>{block.title}</h2>
          {ctx.preview ? (
            <div className="rounded-xl border border-dashed border-neutral-400 p-6 opacity-70">
              Тут буде форма замовлення (у редакторі вона неактивна).
            </div>
          ) : (
            <div className="text-left">
              <OrderForm landingId={ctx.landingId} price={ctx.price} cta={block.cta} inverted={onAccent} />
            </div>
          )}
        </section>
      )
    default:
      return null
  }
}

const PY_NESTED = { compact: 'py-2', normal: 'py-4', spacious: 'py-8' }

// Спільна «рамка» блоку: фон, фото, кольори, відступи
export function BlockFrame({ style, nested, children }: { style?: BlockStyle; nested?: boolean; children: React.ReactNode }) {
  const st = style ?? {}
  const bg = st.bg ?? 'none'
  const css: Record<string, string | number | undefined> = {
    ...bgStyle({ color: st.bgColor, image: st.bgImage, overlay: st.overlay }),
  }
  const textColor = st.textColor ?? (st.bgImage && darkOverlay(st.overlay) ? '#ffffff' : undefined)
  if (textColor) css.color = textColor
  if (st.btnColor) css['--accent'] = st.btnColor
  if (st.btnText) css['--on-accent'] = st.btnText

  // Розмір
  if (st.widthPct && st.widthPct < 100) {
    css.width = `${st.widthPct}%`
    css.marginLeft = st.hAlign === 'left' ? 0 : 'auto'
    css.marginRight = st.hAlign === 'right' ? 0 : 'auto'
  }
  if (st.minH && st.minH > 0) {
    css.minHeight = `${st.minH}px`
    css.display = 'flex'
    css.flexDirection = 'column'
    css.justifyContent = st.vAlign === 'center' ? 'center' : st.vAlign === 'bottom' ? 'flex-end' : 'flex-start'
  }

  // Накладання: зсув і шар (на телефоні лише якщо дозволено)
  let layerCls = ''
  if ((st.pos && (st.pos.x || st.pos.y)) || st.z) {
    css['--pos-x'] = `${st.pos?.x ?? 0}px`
    css['--pos-y'] = `${st.pos?.y ?? 0}px`
    css['--z'] = st.z ?? 0
    layerCls =
      st.posMobile === 'all'
        ? 'relative left-[var(--pos-x)] mt-[var(--pos-y)] z-[var(--z)]'
        : 'sm:relative sm:left-[var(--pos-x)] sm:mt-[var(--pos-y)] sm:z-[var(--z)]'
  }
  return (
    <div
      className={`${BG[bg]} ${(nested ? PY_NESTED : PY)[st.space ?? 'normal']} ${SHOW[st.show ?? 'all']} ${st.align === 'center' ? 'text-center' : ''} ${layerCls}`}
      style={css as React.CSSProperties}
    >
      {children}
    </div>
  )
}

export function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  const st = block.style ?? {}
  const bg = st.bg ?? 'none'
  const onDark =
    bg === 'accent' || bg === 'dark' || isDarkColor(st.bgColor) || Boolean(st.bgImage && darkOverlay(st.overlay))
  return (
    <BlockFrame style={block.style} nested={ctx.nested}>
      <Inner block={block} ctx={ctx} onAccent={bg === 'accent'} onDark={onDark} center={st.align === 'center'} />
    </BlockFrame>
  )
}

export function RenderBlocks({ blocks, ctx }: { blocks: Block[]; ctx: Ctx }) {
  return <>{blocks.map((b, i) => <BlockView key={i} block={b} ctx={ctx} />)}</>
}
