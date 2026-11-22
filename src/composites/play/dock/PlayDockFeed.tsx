'use client'

import { PlayDockNotice } from '@/composites/play/dock/PlayDockNotice'
import { PlayResumeCallout } from '@/composites/play/dock/PlayResumeCallout'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayNoticeView, PlayPresence } from '@/types/play'

/**
 * Feed: the game being played, then the news
 * @param {Object} props - Feed
 * @param {PlayPresence | null} props.presence - Game the player sits in
 * @param {PlayNoticeView[]} props.invites - Waiting news
 * @return {JSX.Element}
 */

export const PlayDockFeed = ({
  presence,
  invites,
}: {
  presence: PlayPresence | null
  invites: PlayNoticeView[]
}) => {
  if (!presence && invites.length === 0)
    return <PlayEmpty icon="playFeed">{PLAY_MOBILE_COPY.feedInvitesEmpty}</PlayEmpty>

  return (
    <div className={PLAY_DOCK.rows}>
      {presence && <PlayResumeCallout presence={presence} />}
      {invites.map((notice) => (
        <PlayDockNotice key={notice.id} notice={notice} />
      ))}
    </div>
  )
}
