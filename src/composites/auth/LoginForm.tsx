'use client'

import { useActionState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Field } from '@/components/elements/forms/Field'
import { Input } from '@/components/elements/forms/Input'
import { login, type LoginState } from '@/app/connexion/actions'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'

const INITIAL_STATE: LoginState = {}

/**
 * Discord identifier form, the only way into the dashboard
 * @return {JSX.Element}
 */

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        id="discordId"
        label={AUTH_COPY.field}
        hint={AUTH_COPY.hint}
        error={state.error}
        required
      >
        <Input
          id="discordId"
          name="discordId"
          inputMode="numeric"
          autoComplete="off"
          required
          invalid={Boolean(state.error)}
          aria-describedby={state.error ? 'discordId-error' : 'discordId-hint'}
          placeholder={AUTH_COPY.placeholder}
        />
      </Field>
      <Button type="submit" variant="primary" iconAfter="forward" disabled={isPending}>
        {isPending ? AUTH_COPY.pending : AUTH_COPY.submit}
      </Button>
    </form>
  )
}
