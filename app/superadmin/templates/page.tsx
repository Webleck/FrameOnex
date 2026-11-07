import type { Metadata } from 'next'
import { requireSuperAdmin } from '@/lib/session'
import { supabaseUser } from '@/lib/supabase-server'
import { TEMPLATES } from '@/lib/templates'
import { deleteTemplateAction, restoreTemplateAction } from '../actions'
import { cardCls } from '@/lib/ui'

export const metadata: Metadata = { title: 'Шаблони — супер-адмінка' }

export default async function TemplatesPage() {
  await requireSuperAdmin()
  const sb = await supabaseUser()
  const { data, error } = await sb.from('deleted_templates').select('template_key')
  const deleted = new Set((data ?? []).map((r: { template_key: string }) => r.template_key))

  return (
    <>
      <div>
        <h1 className="text-xl font-bold">Шаблони</h1>
        <p className="text-sm text-neutral-600">
          Видалений шаблон зникає зі списку для всіх клієнтів. Лендінги, які вже створені з нього, не змінюються. Видалений шаблон можна відновити.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Помилка: {error.message}. Чи запущено 003_templates.sql?</p>}

      <div className="space-y-3">
        {TEMPLATES.map((t) => {
          const isDeleted = deleted.has(t.key)
          return (
            <div key={t.key} className={`${cardCls} flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <p className={`font-medium ${isDeleted ? 'text-neutral-400 line-through' : ''}`}>{t.label}</p>
                <p className="text-xs text-neutral-500">
                  ключ: {t.key} · {t.build().length} блоків · {isDeleted ? 'видалено' : 'доступний клієнтам'}
                </p>
              </div>
              {isDeleted ? (
                <form action={restoreTemplateAction}>
                  <input type="hidden" name="key" value={t.key} />
                  <button className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">Відновити</button>
                </form>
              ) : (
                <form action={deleteTemplateAction}>
                  <input type="hidden" name="key" value={t.key} />
                  <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700">Видалити</button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
