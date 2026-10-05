'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { LiveCoordinator } from '@/composites/lives/LiveCoordinator'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { LiveSchedule } from '@/composites/lives/LiveSchedule'
import { LIVE_COPY, LIVE_ROSTER_COPY } from '@/declarations/lives/copy'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, LIVE_BOARD } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'

export interface LiveStripProps {
  live: LiveView
  canMove: boolean
  isSaving: boolean
  onMove: (status: LiveStatusName) => Promise<boolean>
}

/**
 * One live
 * @param {LiveView} live - Live
 * @param {boolean} canMove - Viewer may start
 * @param {boolean} isSaving - Mutation in flight
 * @param {(status: LiveStatusName) => Promise<boolean>} onMove - Status change
 * @return {JSX.Element}
 */

export const LiveStrip = ({ live, canMove, isSaving, onMove }: LiveStripProps) => {
  // Status waiting on a second click
  const [confirming, setConfirming] = useState<LiveStatusName | null>(null)
  const [isRosterOpen, setRosterOpen] = useState(false)

  const platform = LIVE_PLATFORM_REGISTRY.get(live.platform)
  const PlatformIcon = ICONS[platform.icon]
  const DotIcon = ICONS.liveDot
  const isLive = live.status === LiveStatuses.Live

  // Ending or cancelling asks twice
  const request = async (status: LiveStatusName) => {
    if (status !== LiveStatuses.Live && confirming !== status) {
      setConfirming(status)
      return
    }

    await onMove(status)
    setConfirming(null)
  }

  return (
    <article className={cn(LIVE_BOARD.strip, isLive && LIVE_BOARD.stripLive)}>
      <span
        aria-hidden="true"
        className={cn(
          LIVE_BOARD.rule,
          live.platform === LivePlatforms.Twitch ? LIVE_BOARD.ruleTwitch : LIVE_BOARD.ruleYoutube
        )}
      />

      <div className={LIVE_BOARD.top}>
        <span
          className={cn(
            LIVE_BOARD.status,
            isLive ? LIVE_BOARD.statusLive : LIVE_BOARD.statusAnnounced
          )}
        >
          <DotIcon className={isLive ? LIVE_BOARD.dotPulse : LIVE_BOARD.dot} />
          {isLive ? LIVE_COPY.liveBadge : LIVE_COPY.announcedBadge}
        </span>
        <span className={LIVE_BOARD.platform}>
          <PlatformIcon className={LIVE_BOARD.platformIcon} aria-hidden="true" />
          {platform.label}
        </span>
      </div>

      <div className={LIVE_BOARD.head}>
        <Avatar name={live.youtuber.name} src={live.youtuber.avatar} size="xl" />
        <div className={LIVE_BOARD.identity}>
          <h2 className={LIVE_BOARD.creator}>{live.youtuber.name}</h2>
          <p className={LIVE_BOARD.title}>{live.title}</p>
        </div>
      </div>

      <div className={LIVE_BOARD.panels}>
        <LiveSchedule
          isLive={isLive}
          start={(isLive ? live.startedAt : null) ?? live.plannedStartAt}
          end={live.plannedEndAt}
        />
        <LiveCoordinator person={live.coordinator} />
      </div>

      <div className={LIVE_BOARD.actions}>
        <div className={LIVE_BOARD.actionsMain}>
          {isLive ? (
            <Link
              href={ROUTES.live(live.id)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
            >
              {LIVE_COPY.openModView}
            </Link>
          ) : (
            <Button variant="secondary" disabled title={LIVE_COPY.modViewLocked}>
              {LIVE_COPY.openModView}
            </Button>
          )}

          {canMove && !isLive && (
            <Button
              variant="success"
              isLoading={isSaving}
              onClick={() => request(LiveStatuses.Live)}
            >
              {LIVE_COPY.start}
            </Button>
          )}
        </div>

        <div className={LIVE_BOARD.actionsSide}>
          {isLive && live.permissions.includes(Permissions.LiveLogRead) && (
            <Link
              href={ROUTES.liveReport(live.id)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
            >
              {LIVE_REPORT_COPY.logTitle}
            </Link>
          )}

          <Button
            variant="ghost"
            aria-expanded={isRosterOpen}
            onClick={() => setRosterOpen((open) => !open)}
          >
            {isRosterOpen ? LIVE_ROSTER_COPY.close : LIVE_ROSTER_COPY.open}
          </Button>

          {canMove && (
            <Button
              variant={confirming ? 'danger' : 'ghost'}
              isLoading={isSaving && confirming !== null}
              onClick={() => request(isLive ? LiveStatuses.Ended : LiveStatuses.Cancelled)}
            >
              {isLive ? LIVE_COPY.end : LIVE_COPY.cancel}
            </Button>
          )}
        </div>

        {confirming && (
          <p className={LIVE_BOARD.confirm}>
            {confirming === LiveStatuses.Ended ? LIVE_COPY.confirmEnd : LIVE_COPY.confirmCancel}
          </p>
        )}
      </div>

      {isRosterOpen && <LiveRosterBoard liveId={live.id} />}
    </article>
  )
}
