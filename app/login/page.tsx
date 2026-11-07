import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUser } from '@/lib/session'
import { LoginForm } from '@/components/AuthForms'

export const metadata: Metadata = { title: 'Вхід — FrameOnex' }

export default async function LoginPage() {
  if (await getUser()) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <Link href="/" className="text-lg font-bold text-teal-700">FrameOnex</Link>
        <h1 className="mb-4 mt-2 text-xl font-semibold">Вхід в кабінет</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-neutral-600">
          Немає акаунта? <Link href="/#register" className="font-medium text-teal-700 hover:underline">Зареєструватися</Link>
        </p>
      </div>
    </div>
  )
}
