'use client'

import { useActionState } from 'react'
import { loginAction, registerAction } from '@/app/actions/auth'
import { inputCls, btnCls } from '@/lib/ui'

type State = { error?: string; info?: string }
const initial: State = {}

function Message({ state }: { state: State }) {
  if (state.error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
  if (state.info) return <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{state.info}</p>
  return null
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial)
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="shop">Назва магазину</label>
        <input id="shop" name="shop" required maxLength={60} className={inputCls} placeholder="Наприклад, Мій магазин" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} placeholder="Мінімум 8 символів" />
      </div>
      <Message state={state} />
      <button type="submit" disabled={pending} className={`${btnCls} w-full disabled:opacity-60`}>
        {pending ? 'Зачекайте...' : 'Створити акаунт'}
      </button>
    </form>
  )
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial)
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      <Message state={state} />
      <button type="submit" disabled={pending} className={`${btnCls} w-full disabled:opacity-60`}>
        {pending ? 'Зачекайте...' : 'Увійти'}
      </button>
    </form>
  )
}
