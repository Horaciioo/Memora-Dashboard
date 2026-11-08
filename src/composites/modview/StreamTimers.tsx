'use client'

import { useClock } from '@/core/hooks/interaction/state/useClock'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_STREAM } from '@/declarations/ui/variants'
import { SECOND_MS } from '@/utils/constants/time'
import { formatStopwatch } from '@/utils/format/countdown'

export interface StreamTimersProps {
  streamStartedAt?: string | null
  liveStartedAt?: string | null
}

/**
 * Twitch stream and Memora live stopwatches
 * @param {StreamTimersProps} props - Start moments
 * @return {JSX.Element | null}
 */

export const StreamTimers = ({ streamStartedAt, liveStartedAt }: StreamTimersProps) => {
  const now = useClock(SECOND_MS)
  const rows = [
    {
      key: 'stream',
      icon: ICONS.twitch,
      startedAt: streamStartedAt,
      label: MODVIEW_COPY.streamTimer,
    },
    { key: 'live', icon: ICONS.clock, startedAt: liveStartedAt, label: MODVIEW_COPY.liveTimer },
  ].filter((row) => row.startedAt)
  if (rows.length === 0) return null

  return (
    <div className={MODVIEW_STREAM.timers}>
      {rows.map(({ key, icon: Icon, startedAt, label }) => (
        <p key={key} className={MODVIEW_STREAM.timer} title={label}>
          <Icon className={MODVIEW_STREAM.viewersIcon} aria-hidden="true" />
          <span>{formatStopwatch((now - Date.parse(startedAt!)) / SECOND_MS)}</span>
          <span className="sr-only">{label}</span>
        </p>
      ))}
    </div>
  )
}
