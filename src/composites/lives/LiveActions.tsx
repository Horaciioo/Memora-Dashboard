'use client'

import Link from '@/components/elements/navigation/AppLink'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { LIVE_COPY, LIVE_ROSTER_COPY } from '@/declarations/lives/copy'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { BUTTON_STYLES, LIVE_BOARD } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'

export interface LiveActionsProps {
  live: LiveView
  canMove: boolean
  isSaving: boolean
  onMove: (status: LiveStatusName) => Promise<boolean>
  // Mod View entry drawn elsewhere
  hideOpen?: boolean
  className?: string
}

/**
 * Buttons of one live, ending and cancelling ask twice
 * @param {LiveView} live - Live
 * @param {boolean} canMove - Viewer may start
 * @param {boolean} isSaving - Mutation in flight
 * @param {(status: LiveStatusName) => Promise<boolean>} onMove - Status change
 * @param {boolean} [hideOpen] - Mod View entry drawn elsewhere
 * @param {string} [className] - Row classes
 * @return {JSX.Element}
 */

export const LiveActions = ({
  live,
  canMove,
  isSaving,
  onMove,
  hideOpen,
  className,
}: LiveActionsProps) => {
  // Status waiting on a second click
  const [confirming, setConfirming] = useState<LiveStatusName | null>(null)
  const [isRosterOpen, setRosterOpen] = useState(false)
  const isLive = live.status === LiveStatuses.Live

  const request = async (status: LiveStatusName) => {
    if (status !== LiveStatuses.Live) {
      setConfirming(status)
      return
    }

    await onMove(status)
  }

  const isEnding = confirming === LiveStatuses.Ended

  return (
    <>
      <div className={cn(LIVE_BOARD.actions, className)}>
        {isLive
          ? !hideOpen && (
              <Link
                href={ROUTES.live(live.id)}
                className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
              >
                {LIVE_COPY.openModView}
              </Link>
            )
          : canMove && (
              <Button
                variant="success"
                isLoading={isSaving}
                onClick={() => request(LiveStatuses.Live)}
              >
                {LIVE_COPY.start}
              </Button>
            )}
        {isLive && live.permissions.includes(Permissions.LiveLogRead) && (
          <Link
            href={ROUTES.liveReport(live.id)}
            className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
          >
            {LIVE_REPORT_COPY.open}
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
            variant="ghost"
            onClick={() => request(isLive ? LiveStatuses.Ended : LiveStatuses.Cancelled)}
          >
            {isLive ? LIVE_COPY.end : LIVE_COPY.cancel}
          </Button>
        )}
      </div>
      {isRosterOpen && <LiveRosterBoard liveId={live.id} />}
      <ConfirmDialog
        open={confirming !== null}
        title={isEnding ? LIVE_COPY.end : LIVE_COPY.cancel}
        description={isEnding ? LIVE_COPY.confirmEnd : LIVE_COPY.confirmCancel}
        confirmLabel={isEnding ? LIVE_COPY.end : LIVE_COPY.cancel}
        pending={isSaving}
        onCancel={() => setConfirming(null)}
        onConfirm={async () => {
          if (confirming) await onMove(confirming)
          setConfirming(null)
        }}
      />
    </>
  )
}
