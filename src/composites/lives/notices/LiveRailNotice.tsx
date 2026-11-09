'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_NOTICE } from '@/declarations/ui/variants'
import type { LiveBeacon } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'

export interface LiveRailNoticeProps {
  live: LiveBeacon | null
  // Share of the shortcut row, 0 to 1
  pointedAt?: number
}

/**
 * Red card under the Live shortcut: the creator on air
 * @param {LiveBeacon | null} live - Open lives
 * @param {number} [pointedAt] - Draws the point under this share of the row
 * @return {JSX.Element | null}
 */

export const LiveRailNotice = ({ live, pointedAt }: LiveRailNoticeProps) => {
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const onAir = live?.lives.find((entry) => entry.status === LiveStatuses.Live)
  if (!onAir || dismissedId === onAir.id) return null

  const GoIcon = ICONS.next
  const CloseIcon = ICONS.close

  return (
    <div className={LIVE_NOTICE.wrap}>
      {pointedAt !== undefined && (
        <span
          className={LIVE_NOTICE.caret}
          style={{ left: `calc(${pointedAt * 100}% - 0.375rem)` }}
          aria-hidden="true"
        />
      )}
      <div className={LIVE_NOTICE.card}>
        <Link href={ROUTES.lives} className={LIVE_NOTICE.link}>
          <Avatar
            name={onAir.creator}
            src={onAir.creatorAvatar}
            size="md"
            className={LIVE_NOTICE.avatar}
          />
          <span className={LIVE_NOTICE.text}>
            {LIVE_COPY.railLive.replace('{creator}', onAir.creator)}
          </span>
          <GoIcon className={LIVE_NOTICE.go} aria-hidden="true" />
        </Link>
        <button
          type="button"
          className={LIVE_NOTICE.close}
          aria-label={LIVE_COPY.dismiss}
          onClick={() => setDismissedId(onAir.id)}
        >
          <CloseIcon className={LIVE_NOTICE.closeGlyph} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
