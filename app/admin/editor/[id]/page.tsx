import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import Editor from '@/components/editor/Editor'
import { toPuckData, sanitizeBlocks } from '@/lib/blocks'

export const metadata = { title: 'FrameOnex · Редактор', robots: { index: false, follow: false } }

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { data: landing } = await supabase
    .from('landings').select('id,title,slug,blocks,settings,draft,product_id').eq('id', id).maybeSingle()
  if (!landing) notFound()
  const { data: product } = await supabase
    .from('products').select('sale_price').eq('id', landing.product_id).maybeSingle()

  // Якщо є чернетка, редактор відкривається з нею
  const src = landing.draft ?? { blocks: landing.blocks, settings: landing.settings }

  return (
    <Editor
      landingId={landing.id}
      title={landing.title}
      slug={landing.slug}
      price={Number(product?.sale_price ?? 0)}
      initialData={toPuckData(sanitizeBlocks(src.blocks), src.settings)}
      hasDraft={Boolean(landing.draft)}
    />
  )
}
