'use client'

import { Dialog } from '@/components/structures/Dialog'
import { TwoFactorPanel } from '@/composites/security/TwoFactorPanel'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'

/**
 * Unlock overlay
 * @return {JSX.Element}
 */

export const SealDialog = () => {
  const { factor, isPrompting, dismissPrompt } = useSeal()
  const isEnrolling = !factor.state.isEnrolled

  const close = () => {
    factor.dismiss()
    dismissPrompt()
  }

  return (
    <Dialog
      open={isPrompting}
      onClose={close}
      size="md"
      title={isEnrolling ? TWO_FACTOR_COPY.enrolTitle : TWO_FACTOR_COPY.unlockTitle}
      description={isEnrolling ? TWO_FACTOR_COPY.missingLead : TWO_FACTOR_COPY.unlockLead}
    >
      <TwoFactorPanel mode={isEnrolling ? 'enrol' : 'unlock'} onDone={close} />
    </Dialog>
  )
}
