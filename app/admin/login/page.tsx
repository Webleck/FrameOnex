import { redirect } from 'next/navigation'
import { checkPassword, createSession, isAdmin } from '@/lib/auth'
import { inputCls, btnCls } from '@/lib/ui'

export const metadata = { title: 'FrameOnex · Вхід', robots: { index: false, follow: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect('/admin/orders')
  const { error } = await searchParams

  async function login(formData: FormData) {
    'use server'
    const ok = checkPassword(String(formData.get('password') ?? ''))
    if (!ok) {
      await new Promise((r) => setTimeout(r, 800)) // уповільнює підбір пароля
      redirect('/admin/login?error=1')
    }
    await createSession()
    redirect('/admin/orders')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4">
      <form action={login} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">FrameOnex</h1>
        <p className="text-sm text-neutral-500">Вхід в адмінку</p>
        <input name="password" type="password" required autoFocus placeholder="Пароль" className={inputCls} />
        {error && <p className="text-sm text-red-600">Неправильний пароль</p>}
        <button className={`${btnCls} w-full`}>Увійти</button>
      </form>
    </main>
  )
}
