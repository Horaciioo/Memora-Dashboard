'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { RELEASE_NOTICE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_NOTICE } from '@/declarations/ui/variants'
import type { LiveBeacon } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'

export interface LiveRailNoticeProps {
  live: LiveBeacon | null
  // Share of the shortcut row, 0 to 1
  pointedAt?: number
}

/**
 * Live rail notice
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
    <div className={cn(RELEASE_NOTICE.wrap, pointedAt !== undefined && RELEASE_NOTICE.wrapPointed)}>
      {pointedAt !== undefined && (
        <span
          className={RELEASE_NOTICE.caret}
          style={{ left: `calc(${pointedAt * 100}% - 0.375rem)` }}
          aria-hidden="true"
        />
      )}
      <div className={RELEASE_NOTICE.frame}>
        <span className={RELEASE_NOTICE.veil} aria-hidden="true" />
        <Link href={ROUTES.lives} className={RELEASE_NOTICE.link}>
          <span className={RELEASE_NOTICE.sheen} aria-hidden="true" />
          <span className={RELEASE_NOTICE.kicker}>{LIVE_COPY.liveBadge}</span>
          <span className={LIVE_NOTICE.creator}>
            <Avatar
              name={onAir.creator}
              src={onAir.creatorAvatar}
              size="md"
              className={LIVE_NOTICE.avatar}
            />
            <span className={LIVE_NOTICE.text}>
              {LIVE_COPY.railLive.replace('{creator}', onAir.creator)}
            </span>
          </span>
          <span className={RELEASE_NOTICE.cta}>
            {LIVE_COPY.urgentOpen}
            <GoIcon className={RELEASE_NOTICE.ctaIcon} aria-hidden="true" />
          </span>
        </Link>
        <button
          type="button"
          title={LIVE_COPY.dismiss}
          className={RELEASE_NOTICE.dismiss}
          aria-label={LIVE_COPY.dismiss}
          onClick={() => setDismissedId(onAir.id)}
        >
          <CloseIcon className={RELEASE_NOTICE.dismissIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
