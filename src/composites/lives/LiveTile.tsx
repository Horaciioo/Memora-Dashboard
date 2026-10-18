'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { LiveActions } from '@/composites/lives/LiveActions'
import type { LiveActionsProps } from '@/composites/lives/LiveActions'
import { LiveCoordinator } from '@/composites/lives/LiveCoordinator'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_TILE } from '@/declarations/ui/variants'
import { formatClock, formatRelativeDay } from '@/utils/format/dates'

/**
 * Live still to come, a compact portrait tile
 * @param {LiveActionsProps} props - Live and its gestures
 * @return {JSX.Element}
 */

export const LiveTile = (props: LiveActionsProps) => {
  const { live } = props
  const PlatformIcon = ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon]
  // A day already gone says nothing useful
  const [now] = useState(() => Date.now())
  const isAhead = new Date(live.plannedStartAt).getTime() > now
  const backdrop = live.youtuber.banner ?? live.youtuber.avatar

  return (
    <article className={LIVE_TILE.root}>
      <div className={LIVE_TILE.cover}>
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" loading="lazy" className={LIVE_TILE.coverImage} />
        )}
        <span className={LIVE_TILE.platform}>
          <PlatformIcon className={LIVE_TILE.platformGlyph} />
          {LIVE_PLATFORM_REGISTRY.label(live.platform)}
        </span>
      </div>
      <div className={LIVE_TILE.body}>
        <div className={LIVE_TILE.head}>
          <Avatar
            name={live.youtuber.name}
            src={live.youtuber.avatar}
            size="xl"
            className={LIVE_TILE.portrait}
          />
          <p className={LIVE_TILE.when}>
            <span className={LIVE_TILE.clock}>{formatClock(live.plannedStartAt)}</span>
            {isAhead && (
              <span className={LIVE_TILE.day}>{formatRelativeDay(live.plannedStartAt)}</span>
            )}
          </p>
        </div>
        <div>
          <h3 className={LIVE_TILE.creator}>{live.youtuber.name}</h3>
          <p className={LIVE_TILE.title}>{live.title}</p>
        </div>
        <LiveCoordinator seats={live.coordinators} gaps={live.gaps} />
        <LiveActions {...props} className={LIVE_TILE.actions} />
      </div>
    </article>
  )
}
