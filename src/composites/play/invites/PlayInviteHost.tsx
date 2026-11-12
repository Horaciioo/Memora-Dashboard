'use client'

import { usePathname } from 'next/navigation'

import { PlayInviteBubble } from '@/composites/play/invites/PlayInviteBubble'
import { usePlayNoticeFeed } from '@/core/hooks/data/play/usePlayNoticeFeed'
import { usePendingNotice } from '@/core/store/play/playNotices'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_FEED_BEACON } from '@/declarations/ui/beacons'
import { PLAY_INVITE_CALL } from '@/declarations/ui/variants'

/**
 * Game invitations of the member: over the dock feed key in Play, on phones elsewhere
 * @param {Object} props - Host
 * @param {boolean} [props.isPlay] - Inside Memora Play
 * @return {JSX.Element | null}
 */

export const PlayInviteHost = ({ isPlay }: { isPlay?: boolean }) => {
  usePlayNoticeFeed()
  const invite = usePendingNotice()
  const pathname = usePathname()

  if (!invite) return null
  // The hub shows it under the profile card
  if (isPlay && pathname === ROUTES.play) return null
  if (isPlay) return <PlayInviteBubble key={invite.id} invite={invite} beacon={PLAY_FEED_BEACON} />
  // Home shows its own box, the rail its notice
  if (pathname === ROUTES.dashboard) return null

  return <PlayInviteBubble key={invite.id} invite={invite} className={PLAY_INVITE_CALL.phoneOnly} />
}
