'use client'

import { Button } from '@/components/elements/actions/Button'
import { API_ROUTES } from '@/core/lib/api/routes'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_FAILURES } from '@/declarations/unban/failures'
import type { UnbanFailureName } from '@/declarations/unban/failures'
import { ONBOARDING_STYLES, UNBAN_PUBLIC_STYLES } from '@/declarations/ui/variants'

// Sentence per refusal
const FAILURES: Record<UnbanFailureName, string> = {
  [UNBAN_FAILURES.Refused]: UNBAN_PUBLIC_COPY.signInRefused,
  [UNBAN_FAILURES.WrongAccount]: UNBAN_PUBLIC_COPY.wrongAccount,
}

export interface UnbanGateProps {
  slug: string
  failure: UnbanFailureName | null
  // A request exists but belongs to another account
  isOtherAccount?: boolean
}

/**
 * Discord sign-in asked before the form or the follow-up
 * @param {string} slug - Creator segment
 * @param {UnbanFailureName | null} failure - Why the last attempt was refused
 * @param {boolean} [isOtherAccount] - The signed-in account is not the one of the request
 * @return {JSX.Element}
 */

export const UnbanGate = ({ slug, failure, isOtherAccount }: UnbanGateProps) => (
  <div className={UNBAN_PUBLIC_STYLES.stack}>
    <p className={ONBOARDING_STYLES.lead}>{UNBAN_PUBLIC_COPY.signInHint}</p>
    {failure && <p className={UNBAN_PUBLIC_STYLES.error}>{FAILURES[failure]}</p>}
    {isOtherAccount && !failure && (
      <p className={UNBAN_PUBLIC_STYLES.error}>{UNBAN_PUBLIC_COPY.otherAccount}</p>
    )}
    <div className={ONBOARDING_STYLES.actions}>
      <Button
        variant="primary"
        icon="discord"
        onClick={() => window.location.assign(API_ROUTES.unbanDiscord(slug))}
      >
        {UNBAN_PUBLIC_COPY.signIn}
      </Button>
    </div>
  </div>
)
