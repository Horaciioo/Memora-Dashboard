'use client'

import { Button } from '@/components/elements/actions/Button'
import { ROUTES } from '@/declarations/navigation'
import { INTEGRATION_LINK_COPY } from '@/declarations/onboarding/copy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { ButtonVariant } from '@/declarations/ui/variants'

export interface CopyInviteLinkProps {
  token: string
  variant?: ButtonVariant
}

/**
 * Copy the public form link of an open invitation
 * @param {string} token - Link token
 * @param {ButtonVariant} [variant] - Button shape, secondary by default
 * @return {JSX.Element}
 */

export const CopyInviteLink = ({ token, variant = 'secondary' }: CopyInviteLinkProps) => {
  const { notify } = useNotifications()

  const copy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${ROUTES.integration(token)}`)
    notify({ tone: 'success', title: INTEGRATION_LINK_COPY.copied })
  }

  return (
    <Button variant={variant} icon="copy" onClick={() => void copy()}>
      {INTEGRATION_LINK_COPY.copy}
    </Button>
  )
}
