'use client'

import { useActionState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { login, type LoginState } from '@/app/login/actions'

const INITIAL_STATE: LoginState = {}

/**
 * Classic email/password login form
 * @return {JSX.Element}
 */

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="demo@example.com"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="password"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm"
        />
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-xs text-[var(--color-ink-subtle)] italic">
        Demo credentials are pre-filled. This checks a hardcoded value in
        src/core/lib/auth/session.ts — replace with real authentication before shipping.
      </p>
    </form>
  )
}
