'use client'

import { Button } from '@/components/elements/actions/Button'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

export interface CopyInviteLinkProps {
  token: string
}

/**
 * Copy the public admission link of an open session
 * @param {string} token - Invite token
 * @return {JSX.Element}
 */

export const CopyInviteLink = ({ token }: CopyInviteLinkProps) => {
  const { notify } = useNotifications()

  const copy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${ROUTES.admission(token)}`)
    notify({ tone: 'success', title: ACADEMY_COPY.inviteCopied })
  }

  return (
    <Button variant="secondary" icon="copy" onClick={() => void copy()}>
      {ACADEMY_COPY.inviteCopyLink}
    </Button>
  )
}
