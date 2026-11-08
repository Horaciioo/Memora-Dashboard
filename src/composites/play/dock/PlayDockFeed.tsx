'use client'

import { PlayDockNotice } from '@/composites/play/dock/PlayDockNotice'
import { PlayResumeCallout } from '@/composites/play/dock/PlayResumeCallout'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB_COPY } from '@/declarations/play'
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
  if (!presence && invites.length === 0) {
    const VoidIcon = ICONS.playFeed

    return (
      <p className={PLAY_DOCK.void}>
        <VoidIcon className={PLAY_DOCK.voidIcon} aria-hidden="true" />
        {PLAY_HUB_COPY.feedEmpty}
      </p>
    )
  }

  return (
    <div className={PLAY_DOCK.rows}>
      {presence && <PlayResumeCallout presence={presence} />}
      {invites.map((notice) => (
        <PlayDockNotice key={notice.id} notice={notice} />
      ))}
    </div>
  )
}
