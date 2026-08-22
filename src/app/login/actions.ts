'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidDemoCredentials, SESSION_COOKIE } from '@/core/lib/auth/session'

export interface LoginState {
  error?: string
}

/**
 * Demo login action
 * @param {LoginState} _previousState - Previous form state, unused
 * @param {FormData} formData - Submitted email and password
 * @return {Promise<LoginState>}
 */

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!isValidDemoCredentials(email, password)) {
    return { error: 'Invalid email or password' }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/overview')
}

/**
 * Clears the session cookie and returns to the login page
 * @return {Promise<never>}
 */

export async function logout(): Promise<never> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}
