import { supabase } from './supabase'

// Працює як раніше: без chatId бере TELEGRAM_CHAT_ID зі змінних середовища
export async function sendTelegram(text: string, chatId?: string | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const target = chatId || process.env.TELEGRAM_CHAT_ID
  if (!token || !target) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: target, text }),
  })
}

// Сповіщення про замовлення конкретного клієнта.
// Чат береться з його workspace. Лише власний workspace 'main' має запасний чат зі змінних
// середовища, щоб замовлення чужих клієнтів ніколи не потрапляли вам у Telegram.
export async function notifyWorkspace(workspaceId: string, text: string) {
  const { data: ws } = await supabase
    .from('workspaces')
    .select('slug, telegram_chat_id')
    .eq('id', workspaceId)
    .maybeSingle()
  if (!ws) return
  const chat = ws.telegram_chat_id || (ws.slug === 'main' ? process.env.TELEGRAM_CHAT_ID : null)
  if (chat) await sendTelegram(text, chat)
}
