import type { Metadata } from 'next'
import { LoginForm } from '@/composites/auth/LoginForm'
import { AuthShell } from '@/layouts/AuthShell'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'

export const metadata: Metadata = { title: AUTH_COPY.title }

/**
 * Sign-in screen
 * @return {JSX.Element} - Auth shell with the identifier form
 */

export default function LoginPage() {
  return (
    <AuthShell title={AUTH_COPY.title} subtitle={AUTH_COPY.subtitle}>
      <LoginForm />
    </AuthShell>
  )
}
