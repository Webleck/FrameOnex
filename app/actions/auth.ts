'use server'

import { redirect } from 'next/navigation'
import { supabaseUser } from '@/lib/supabase-server'

type State = { error?: string; info?: string }

const EMAIL = /^\S+@\S+\.\S+$/

export async function registerAction(_prev: State, formData: FormData): Promise<State> {
  const shop = String(formData.get('shop') ?? '').trim().slice(0, 60)
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!shop) return { error: 'Вкажіть назву магазину' }
  if (!EMAIL.test(email)) return { error: 'Вкажіть коректний email' }
  if (password.length < 8) return { error: 'Пароль має містити щонайменше 8 символів' }

  const sb = await supabaseUser()
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { workspace_name: shop } },
  })

  if (error) {
    if (/already/i.test(error.message)) return { error: 'Цей email уже зареєстровано. Спробуйте увійти.' }
    if (/password/i.test(error.message)) return { error: 'Пароль занадто простий. Додайте літери різного регістру та цифри.' }
    return { error: 'Не вдалося зареєструватися. Спробуйте ще раз трохи пізніше.' }
  }

  // Якщо в Supabase увімкнено підтвердження email, сесії ще немає
  if (!data.session) {
    return { info: 'Ми надіслали лист для підтвердження. Перейдіть за посиланням у листі, а потім увійдіть.' }
  }

  redirect('/dashboard')
}

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!EMAIL.test(email) || !password) return { error: 'Вкажіть email і пароль' }

  const sb = await supabaseUser()
  const { error } = await sb.auth.signInWithPassword({ email, password })

  if (error) {
    if (/confirm/i.test(error.message)) return { error: 'Спершу підтвердьте email за посиланням у листі' }
    return { error: 'Невірний email або пароль' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const sb = await supabaseUser()
  await sb.auth.signOut()
  redirect('/')
}
