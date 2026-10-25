import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { RenderBlocks } from '@/components/Blocks'
import ViewTracker from '@/components/ViewTracker'
import { OrderModalProvider, OrderButton } from '@/components/OrderModal'
import { safeAccent, fontStack, safeColor, safeBgUrl, bgStyle, darkOverlay } from '@/lib/theme'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function load(slug: string) {
  const { data: landing, error } = await supabase
    .from('landings').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (error) console.error('landing error:', error.message)
  if (!landing) return null
  const { data: product, error: pErr } = await supabase
    .from('products').select('*').eq('id', landing.product_id).single()
  if (pErr) console.error('product error:', pErr.message)
  return product ? { landing, product } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const d = await load(slug)
  return { title: d?.landing.title ?? 'Сторінку не знайдено' }
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const d = await load(slug)
  if (!d) notFound()
  const cfg = d.landing.settings ?? {}
  const accent = safeAccent(cfg.accent)
  const bgImage = safeBgUrl(cfg.bgImage)
  const textColor = safeColor(cfg.textColor) ?? (bgImage && darkOverlay(cfg.overlay) ? '#ffffff' : undefined)
  const pageStyle = {
    '--accent': accent,
    fontFamily: fontStack(cfg.font),
    ...bgStyle({ color: safeColor(cfg.bgColor), image: bgImage, overlay: cfg.overlay }),
    ...(textColor ? { color: textColor } : {}),
  } as React.CSSProperties
  const orderCta =
    (d.landing.blocks as { type: string; cta?: string }[]).find((b) => b.type === 'order')?.cta || 'Замовити'
  const price = Number(d.product.sale_price)

  return (
    <OrderModalProvider
      landingId={d.landing.id}
      price={price}
      productName={d.product.name}
      cta={orderCta}
      enabled={cfg.popup !== 'off'}
      accent={accent}
      fontFamily={fontStack(cfg.font)}
    >
    <main style={pageStyle} className="min-h-screen overflow-x-clip bg-neutral-50 pb-24 text-neutral-900 md:bg-fixed">
      <ViewTracker landingId={d.landing.id} />
      <RenderBlocks
        blocks={d.landing.blocks}
        ctx={{ landingId: d.landing.id, price }}
      />
      <OrderButton className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] rounded-xl bg-[var(--accent)] py-4 text-center text-lg font-semibold text-[var(--on-accent,#fff)] shadow-lg sm:hidden">
        Замовити — {price} грн
      </OrderButton>
    </main>
    </OrderModalProvider>
  )
}
