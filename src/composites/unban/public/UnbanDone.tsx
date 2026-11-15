import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_PUBLIC_STYLES } from '@/declarations/ui/variants'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import type { SubmitOutcome } from '@/types/unban'

export interface UnbanDoneProps {
  outcome: SubmitOutcome
}

/**
 * Confirmation once the request is filed
 * @param {SubmitOutcome} outcome - Reference and expiry returned by the server
 * @return {JSX.Element}
 */

export const UnbanDone = ({ outcome }: UnbanDoneProps) => (
  <div className={UNBAN_PUBLIC_STYLES.center}>
    <p className={UNBAN_PUBLIC_STYLES.title}>{UNBAN_PUBLIC_COPY.doneTitle}</p>
    <p className={ONBOARDING_STYLES.lead}>{UNBAN_PUBLIC_COPY.doneLead}</p>
    <span className={UNBAN_PUBLIC_STYLES.label}>{UNBAN_PUBLIC_COPY.reference}</span>
    <p className={UNBAN_PUBLIC_STYLES.reference}>{outcome.reference}</p>
    <p className={ONBOARDING_STYLES.lead}>{UNBAN_PUBLIC_COPY.keepLink}</p>
  </div>
)
