'use client'

import { useActionState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import {
  acceptConsent,
  refuseConsent,
  type ConsentState,
} from '@/app/(dashboard)/consentement/actions'
import { HISTORY_CONSENT } from '@/declarations/system/privacy'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import { CONSENT_STYLES } from '@/declarations/ui/variants'

const INITIAL_STATE: ConsentState = {}

/**
 * Blocking screen asking a member already in the database for the history agreement
 * @return {JSX.Element}
 */

export const HistoryConsentGate = () => {
  const [state, formAction, isPending] = useActionState(acceptConsent, INITIAL_STATE)

  return (
    <div className={CONSENT_STYLES.stack}>
      <h2 className={CONSENT_STYLES.heading}>{HISTORY_CONSENT.title}</h2>
      <div className={CONSENT_STYLES.body}>
        {HISTORY_CONSENT.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <form action={formAction} className={CONSENT_STYLES.stack} id="consent">
        <label className={CONSENT_STYLES.choice} htmlFor="agreed">
          <input id="agreed" name="agreed" type="checkbox" />
          <span>{HISTORY_CONSENT.label}</span>
        </label>
        {state.error && <p className={CONSENT_STYLES.error}>{state.error}</p>}
      </form>
      <div className={CONSENT_STYLES.actions}>
        <Button
          type="submit"
          form="consent"
          variant="success"
          className={CONSENT_STYLES.action}
          disabled={isPending}
        >
          {isPending ? CONSENT_COPY.pending : CONSENT_COPY.accept}
        </Button>
        <span className={CONSENT_STYLES.divider} aria-hidden="true" />
        <form action={refuseConsent}>
          <Button type="submit" variant="danger" className={CONSENT_STYLES.action}>
            {CONSENT_COPY.refuse}
          </Button>
        </form>
      </div>
    </div>
  )
}
