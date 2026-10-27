'use client'

import { usePathname } from 'next/navigation'

import { PlayInviteBubble } from '@/composites/play/invites/PlayInviteBubble'
import { usePlayInviteFeed } from '@/core/hooks/data/play/usePlayInviteFeed'
import { usePendingInvite } from '@/core/store/playInvites'
import { ROUTES } from '@/declarations/navigation'

/**
 * Game invitations of the member, the home page showing its own popup
 * @return {JSX.Element | null}
 */

export const PlayInviteHost = () => {
  usePlayInviteFeed()
  const invite = usePendingInvite()
  const pathname = usePathname()

  if (!invite || pathname === ROUTES.dashboard) return null

  return <PlayInviteBubble key={invite.id} invite={invite} />
}
