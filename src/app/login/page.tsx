import { LoginForm } from '@/composites/auth/LoginForm'
import { AuthShell } from '@/layouts/AuthShell'

export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Dashboard Template">
      <LoginForm />
    </AuthShell>
  )
}
