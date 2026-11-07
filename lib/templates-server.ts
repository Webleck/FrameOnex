import { supabase } from './supabase'
import { TEMPLATES } from './templates'

// Шаблони, які не видалив супер-адмін. Використовувати скрізь, де клієнт обирає шаблон
// (форма нового лендінгу) і при створенні лендінгу з шаблону на сервері.
export async function getAvailableTemplates() {
  const { data, error } = await supabase.from('deleted_templates').select('template_key')
  if (error) return TEMPLATES // таблиці ще немає: показуємо всі
  const hidden = new Set((data ?? []).map((r: { template_key: string }) => r.template_key))
  return TEMPLATES.filter((t) => !hidden.has(t.key))
}
