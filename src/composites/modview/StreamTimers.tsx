'use client'

import { useClock } from '@/core/hooks/interaction/state/time/useClock'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_STREAM } from '@/declarations/ui/variants'
import { SECOND_MS } from '@/utils/constants/time'
import { cn } from '@/utils/classnames'
import { formatLag, formatStopwatch } from '@/utils/format/countdown'

export interface StreamTimersProps {
  streamStartedAt?: string | null
  lag?: number | null
  onRefresh?: () => void
}

/**
 * Twitch stream time and how far behind the live the player is
 * @param {StreamTimersProps} props - Stream start and player delay
 * @return {JSX.Element | null}
 */

export const StreamTimers = ({ streamStartedAt, lag, onRefresh }: StreamTimersProps) => {
  const now = useClock(SECOND_MS)
  const TwitchIcon = ICONS.twitch
  const LagIcon = ICONS.lag
  const RefreshIcon = ICONS.refresh
  if (!streamStartedAt && lag == null && !onRefresh) return null
  // No gap left once rounded to the second
  const isSynced = lag != null && Math.round(lag) === 0

  return (
    <div className={MODVIEW_STREAM.timers}>
      {streamStartedAt && (
        <p
          className={cn(MODVIEW_STREAM.timer, isSynced && MODVIEW_STREAM.timerSynced)}
          title={MODVIEW_COPY.streamTimer}
        >
          <TwitchIcon className={MODVIEW_STREAM.viewersIcon} aria-hidden="true" />
          <span>{formatStopwatch((now - Date.parse(streamStartedAt)) / SECOND_MS)}</span>
          <span className="sr-only">{MODVIEW_COPY.streamTimer}</span>
        </p>
      )}
      {lag != null && (
        <p
          className={cn(MODVIEW_STREAM.timer, isSynced && MODVIEW_STREAM.timerSynced)}
          title={MODVIEW_COPY.lag}
        >
          {!isSynced && <LagIcon className={MODVIEW_STREAM.viewersIcon} aria-hidden="true" />}
          <span>{isSynced ? MODVIEW_COPY.synced : formatLag(lag)}</span>
          <span className="sr-only">{MODVIEW_COPY.lag}</span>
        </p>
      )}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className={MODVIEW_STREAM.timerRefresh}
          title={MODVIEW_COPY.refreshStream}
          aria-label={MODVIEW_COPY.refreshStream}
        >
          <RefreshIcon className={MODVIEW_STREAM.viewersIcon} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
