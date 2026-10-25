import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHmac, createHash, timingSafeEqual } from 'crypto'

const COOKIE = 'admin_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 днів

function sign(value: string) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !process.env.ADMIN_SESSION_SECRET) return false
  return safeEqual(input, expected)
}

export async function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000)
  const jar = await cookies()
  jar.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function isAdmin() {
  if (!process.env.ADMIN_SESSION_SECRET) return false
  const jar = await cookies()
  const v = jar.get(COOKIE)?.value
  if (!v) return false
  const [exp, sig] = v.split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  return safeEqual(sig, sign(exp))
}

// Викликається на кожній сторінці й у кожній дії адмінки
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
