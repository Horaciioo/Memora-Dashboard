'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { ACCOUNT_ACTIVATION_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_STEP_STYLES } from '@/declarations/ui/variants'
import type { AccountActivationView } from '@/types/recruitment'
import { formatDay } from '@/utils/format/time/dates'
import { fillTemplate } from '@/utils/format/strings'

export interface AccountActivationStepProps {
  activation: AccountActivationView
  isSaving: boolean
  canManage: boolean
  onActivate: () => Promise<boolean>
}

/**
 * Controls of the closing timeline step, the moment the accepted candidates get their accounts
 * @param {AccountActivationView} activation - Where the accounts stand
 * @param {boolean} isSaving - Mutation in flight
 * @param {boolean} canManage - Member may open the accounts
 * @param {() => Promise<boolean>} onActivate - Activation handler
 * @return {JSX.Element}
 */

export const AccountActivationStep = ({
  activation,
  isSaving,
  canManage,
  onActivate,
}: AccountActivationStepProps) => {
  const [isAsking, setAsking] = useState(false)

  return (
    <div className={INTEGRATION_STEP_STYLES.frame}>
      {activation.activatedAt ? (
        <div className={INTEGRATION_STEP_STYLES.row}>
          <Status label={ACCOUNT_ACTIVATION_COPY.activated} tone="success" />
          <span className={INTEGRATION_STEP_STYLES.meta}>
            {fillTemplate(ACCOUNT_ACTIVATION_COPY.activatedOn, {
              day: formatDay(activation.activatedAt),
            })}
            {' · '}
            {fillTemplate(ACCOUNT_ACTIVATION_COPY.progress, {
              confirmed: String(activation.confirmed),
              opened: String(activation.opened),
            })}
          </span>
        </div>
      ) : (
        <div className={INTEGRATION_STEP_STYLES.row}>
          <Button
            variant="primary"
            icon="confirm"
            disabled={!canManage}
            onClick={() => setAsking(true)}
          >
            {ACCOUNT_ACTIVATION_COPY.action}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={isAsking}
        title={ACCOUNT_ACTIVATION_COPY.confirmTitle}
        description={ACCOUNT_ACTIVATION_COPY.confirmDescription}
        confirmLabel={ACCOUNT_ACTIVATION_COPY.action}
        pending={isSaving}
        onConfirm={() => {
          void onActivate()
          setAsking(false)
        }}
        onCancel={() => setAsking(false)}
      />
    </div>
  )
}
