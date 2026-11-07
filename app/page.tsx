import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/session'
import { RegisterForm } from '@/components/AuthForms'

export const metadata: Metadata = {
  title: 'FrameOnex — конструктор лендінгів для товарів',
  description: 'Створюйте лендінги для товарів, приймайте замовлення та рахуйте прибуток в одному місці.',
}

type Plan = {
  code: string
  name: string
  price_uah: number
  max_landings: number | null
  max_orders_per_month: number | null
  custom_domain: boolean
}

const FEATURES = [
  { title: 'Візуальний редактор', text: 'Збирайте сторінку з готових блоків перетягуванням: герой, переваги, відгуки, таймер, галерея, відео, порівняння.' },
  { title: 'Готові шаблони', text: 'Запускайте лендінг із шаблону та змінюйте тексти, кольори, шрифти й фони під свій товар.' },
  { title: 'Замовлення в одному місці', text: 'Усі заявки з усіх лендінгів із статусами та номером ТТН, без таблиць і месенджерів.' },
  { title: 'Сповіщення в Telegram', text: 'Нове замовлення одразу приходить у ваш Telegram-чат.' },
  { title: 'Статистика та реклама', text: 'Перегляди, замовлення, витрати на рекламу та закупівельна ціна: видно, який лендінг приносить прибуток.' },
  { title: 'Для телефону і комп’ютера', text: 'Сторінки адаптовані під мобільні, а в редакторі можна окремо переглянути мобільну версію.' },
]

const STEPS = [
  { n: '1', title: 'Зареєструйтесь', text: 'Вкажіть назву магазину, email і пароль.' },
  { n: '2', title: 'Створіть лендінг', text: 'Оберіть шаблон і відредагуйте його в редакторі.' },
  { n: '3', title: 'Приймайте замовлення', text: 'Заявки приходять у кабінет і в Telegram.' },
]

function limit(v: number | null) {
  return v === null ? 'без обмежень' : String(v)
}

export default async function Home() {
  const [user, plansRes] = await Promise.all([
    getUser(),
    supabase
      .from('plans')
      .select('code, name, price_uah, max_landings, max_orders_per_month, custom_domain')
      .eq('is_active', true)
      .order('price_uah'),
  ])
  const plans = (plansRes.data ?? []) as Plan[]

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-teal-700">FrameOnex</span>
          <nav className="flex items-center gap-2 text-sm">
            <a href="#tariffs" className="hidden px-2 py-1 hover:text-teal-700 sm:inline">Тарифи</a>
            {user ? (
              <Link href="/dashboard" className="rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800">Кабінет</Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium hover:bg-neutral-50">Увійти</Link>
                <a href="#register" className="rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800">Реєстрація</a>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              Лендінги для ваших товарів за кілька хвилин
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Збирайте сторінки в візуальному редакторі, приймайте замовлення та бачте всю статистику
              в одному кабінеті. Без програмування й окремого хостингу.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#register" className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Почати безкоштовно</a>
              <a href="#features" className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium hover:bg-neutral-50">Можливості</a>
            </div>
          </div>

          <div id="register" className="scroll-mt-20 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            {user ? (
              <div className="space-y-3 text-center">
                <h2 className="text-xl font-semibold">Ви вже увійшли</h2>
                <Link href="/dashboard" className="inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Перейти в кабінет</Link>
              </div>
            ) : (
              <>
                <h2 className="mb-1 text-xl font-semibold">Створіть акаунт</h2>
                <p className="mb-4 text-sm text-neutral-600">Реєстрація безкоштовна, перші 14 днів діє пробний період.</p>
                <RegisterForm />
                <p className="mt-4 text-center text-sm text-neutral-600">
                  Уже є акаунт? <Link href="/login" className="font-medium text-teal-700 hover:underline">Увійти</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-16 bg-neutral-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Що ви отримуєте</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold sm:text-3xl">Як це працює</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 font-bold text-white">{s.n}</div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="tariffs" className="scroll-mt-16 bg-neutral-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Тарифи</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.code} className="flex flex-col rounded-xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-bold">
                  {p.price_uah === 0 ? 'Безкоштовно' : `${p.price_uah} ₴`}
                  {p.price_uah > 0 && <span className="text-sm font-normal text-neutral-500"> / міс</span>}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-700">
                  <li>Лендінгів: <b>{limit(p.max_landings)}</b></li>
                  <li>Замовлень на місяць: <b>{limit(p.max_orders_per_month)}</b></li>
                  <li>Власний домен: <b>{p.custom_domain ? 'так' : 'ні'}</b></li>
                </ul>
                <a href="#register" className="mt-5 rounded-lg bg-teal-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800">Почати</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} FrameOnex
      </footer>
    </div>
  )
}
