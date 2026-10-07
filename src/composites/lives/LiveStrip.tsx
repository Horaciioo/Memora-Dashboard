'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { LiveCoordinator } from '@/composites/lives/LiveCoordinator'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { LiveSchedule } from '@/composites/lives/LiveSchedule'
import { LIVE_COPY, LIVE_ROSTER_COPY } from '@/declarations/lives/copy'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, LIVE_BOARD } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'
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

  // Buttons in reading order
  const actions = [
    isLive ? (
      <Link
        key="modview"
        href={ROUTES.live(live.id)}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
      >
        {LIVE_COPY.openModView}
      </Link>
    ) : (
      <Button key="modview" variant="secondary" disabled title={LIVE_COPY.modViewLocked}>
        {LIVE_COPY.openModView}
      </Button>
    ),
    canMove && !isLive && (
      <Button
        key="start"
        variant="success"
        isLoading={isSaving}
        onClick={() => request(LiveStatuses.Live)}
      >
        {LIVE_COPY.start}
      </Button>
    ),
    isLive && live.permissions.includes(Permissions.LiveLogRead) && (
      <Link
        key="log"
        href={ROUTES.liveReport(live.id)}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
      >
        {LIVE_REPORT_COPY.logTitle}
      </Link>
    ),
    <Button
      key="roster"
      variant="ghost"
      aria-expanded={isRosterOpen}
      onClick={() => setRosterOpen((open) => !open)}
    >
      {isRosterOpen ? LIVE_ROSTER_COPY.close : LIVE_ROSTER_COPY.open}
    </Button>,
    canMove && (
      <Button
        key="move"
        variant={confirming ? 'danger' : 'ghost'}
        isLoading={isSaving && confirming !== null}
        onClick={() => request(isLive ? LiveStatuses.Ended : LiveStatuses.Cancelled)}
      >
        {isLive ? LIVE_COPY.end : LIVE_COPY.cancel}
      </Button>
    ),
  ].filter(Boolean)

  return (
    <article className={cn(LIVE_BOARD.strip, isLive && LIVE_BOARD.stripLive)}>
      <div className={LIVE_BOARD.head}>
        <Avatar name={live.youtuber.name} src={live.youtuber.avatar} size="xl" />
        <div className={LIVE_BOARD.identity}>
          {isLive && (
            <span className={LIVE_BOARD.onAir}>
              <DotIcon className={LIVE_BOARD.dotPulse} />
              {LIVE_COPY.liveBadge}
            </span>
          )}
          <h2 className={LIVE_BOARD.creator}>{live.youtuber.name}</h2>
          <p className={LIVE_BOARD.title}>{live.title}</p>
        </div>
      </div>

      <div className={LIVE_BOARD.facts}>
        <LiveCoordinator seats={live.coordinators} gaps={live.gaps} />
        <span className={LIVE_BOARD.factDivider} aria-hidden="true" />
        <LiveSchedule
          isLive={isLive}
          start={(isLive ? live.startedAt : null) ?? live.plannedStartAt}
          end={live.plannedEndAt}
        />
      </div>

      <div className={LIVE_BOARD.actions}>
        {actions.map((action, index) => (
          <Fragment key={index}>
            {index > 0 && <span className={LIVE_BOARD.actionDivider} aria-hidden="true" />}
            {action}
          </Fragment>
        ))}
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
