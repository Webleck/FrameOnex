import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin, destroySession } from '@/lib/auth'

export const metadata = { title: 'FrameOnex · Адмінка', robots: { index: false, follow: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  async function logout() {
    'use server'
    await destroySession()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-bold">FrameOnex</span>
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/admin/stats" className="hover:text-teal-700">Статистика</Link>
            <Link href="/admin/orders" className="hover:text-teal-700">Замовлення</Link>
            <Link href="/admin/landings" className="hover:text-teal-700">Лендінги</Link>
            <Link href="/admin/products" className="hover:text-teal-700">Товари</Link>
            <Link href="/admin/ads" className="hover:text-teal-700">Реклама</Link>
          </nav>
          <form action={logout} className="ml-auto">
            <button className="text-sm text-neutral-500 hover:text-neutral-900">Вийти</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
