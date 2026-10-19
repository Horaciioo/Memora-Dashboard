import Link from '@/components/elements/navigation/AppLink'
import { Avatar } from '@/components/elements/display/Avatar'
import { LiveActions } from '@/composites/lives/LiveActions'
import type { LiveActionsProps } from '@/composites/lives/LiveActions'
import { LiveCoordinator } from '@/composites/lives/LiveCoordinator'
import { LiveSchedule } from '@/composites/lives/LiveSchedule'
import { Permissions } from '@/utils/constants/permissions'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_BOARD, LIVE_STAGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Live on air as a poster, the creator first
 * @param {LiveActionsProps} props - Live and its gestures
 * @return {JSX.Element}
 */

export const LiveStage = (props: LiveActionsProps) => {
  const { live } = props
  const ArrowIcon = ICONS.forward
  const backdrop = live.youtuber.banner ?? live.youtuber.avatar

  return (
    <article className={LIVE_STAGE.root}>
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className={LIVE_STAGE.backdrop} />
      )}
      <div className={LIVE_STAGE.wash} aria-hidden="true" />
      <div className={LIVE_STAGE.halo} aria-hidden="true" />

      <div className={LIVE_STAGE.hero}>
        <Avatar
          name={live.youtuber.name}
          src={live.youtuber.avatar}
          size="hero"
          className={LIVE_STAGE.portrait}
        />
        <div className={LIVE_STAGE.identity}>
          {/* Creator and entry share a line, the entry at the far end */}
          <div className={LIVE_STAGE.titleRow}>
            <h2 className={LIVE_STAGE.creator}>{live.youtuber.name}</h2>
            <Link href={ROUTES.live(live.id)} className={LIVE_STAGE.cta}>
              {LIVE_COPY.openModView}
              <ArrowIcon className={LIVE_STAGE.ctaArrow} aria-hidden="true" />
            </Link>
          </div>
          <p className={LIVE_STAGE.title}>{live.title}</p>
        </div>
      </div>

      <div className={LIVE_STAGE.dock}>
        <div className={cn(LIVE_BOARD.facts, LIVE_STAGE.facts)}>
          <LiveCoordinator
            seats={live.coordinators}
            gaps={live.gaps}
            stacked
            editLiveId={live.permissions.includes(Permissions.LiveAnnounce) ? live.id : undefined}
          />
          <span className={LIVE_BOARD.factDivider} aria-hidden="true" />
          <LiveSchedule isLive start={live.plannedStartAt} end={live.plannedEndAt} />
        </div>
        <LiveActions {...props} hideOpen className={LIVE_STAGE.actions} />
      </div>
    </article>
  )
}
