'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { LiveActions } from '@/composites/lives/LiveActions'
import type { LiveActionsProps } from '@/composites/lives/LiveActions'
import { LiveCoordinator } from '@/composites/lives/LiveCoordinator'
import { Permissions } from '@/utils/constants/permissions'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_TILE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'

/**
 * Live still to come, a compact portrait tile
 * @param {LiveActionsProps} props - Live and its gestures
 * @return {JSX.Element}
 */

export const LiveTile = (props: LiveActionsProps) => {
  const { live } = props
  const PlatformIcon = ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon]
  const backdrop = live.youtuber.banner ?? live.youtuber.avatar

  return (
    <article className={LIVE_TILE.root}>
      <div className={LIVE_TILE.cover}>
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" loading="lazy" className={LIVE_TILE.coverImage} />
        )}
      </div>
      <div className={LIVE_TILE.body}>
        <div className={LIVE_TILE.head}>
          <Avatar
            name={live.youtuber.name}
            src={live.youtuber.avatar}
            size="xl"
            className={cn(LIVE_TILE.portrait, '!size-28')}
          />
          <div className={LIVE_TILE.speech}>
            <span className={LIVE_TILE.bubbleDotFar} aria-hidden="true" />
            <span className={LIVE_TILE.bubbleDotNear} aria-hidden="true" />
            <div className={LIVE_TILE.bubble}>
              <h3 className={LIVE_TILE.creator}>
                <PlatformIcon
                  className={LIVE_TILE.titleGlyph}
                  aria-label={LIVE_PLATFORM_REGISTRY.label(live.platform)}
                />
                {live.title}
              </h3>
              <p className={LIVE_TILE.title}>
                {live.plannedEndAt
                  ? LIVE_COPY.plannedRange
                      .replace('{from}', formatClock(live.plannedStartAt))
                      .replace('{to}', formatClock(live.plannedEndAt))
                  : `${LIVE_COPY.plannedAt} ${formatClock(live.plannedStartAt)}`}
              </p>
            </div>
          </div>
        </div>
        <div className={LIVE_TILE.panel}>
          <LiveCoordinator
            seats={live.coordinators}
            gaps={live.gaps}
            editLiveId={live.permissions.includes(Permissions.LiveAnnounce) ? live.id : undefined}
          />
        </div>
        <LiveActions {...props} className={LIVE_TILE.actions} />
      </div>
    </article>
  )
}
