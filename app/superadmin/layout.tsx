import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/session'
import { logoutAction } from '@/app/actions/auth'
import { btn2Cls } from '@/lib/ui'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-teal-700">FrameOnex · супер-адмін</span>
            <nav className="flex gap-3 text-sm">
              <Link href="/superadmin" className="hover:text-teal-700">Клієнти</Link>
              <Link href="/superadmin/templates" className="hover:text-teal-700">Шаблони</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className={btn2Cls}>Кабінет</Link>
            <form action={logoutAction}>
              <button className={btn2Cls}>Вийти</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-4">{children}</main>
    </div>
  )
}
