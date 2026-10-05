import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock, formatRelativeDay, formatSpan } from '@/utils/format/dates'

export interface LiveScheduleProps {
  isLive: boolean
  start: string
  end: string | null
}

/**
 * Start and end as two big times
 * @param {boolean} isLive - Live runs
 * @param {string} start - Start instant
 * @param {string | null} end - Planned end
 * @return {JSX.Element}
 */

export const LiveSchedule = ({ isLive, start, end }: LiveScheduleProps) => (
  <div className={LIVE_BOARD.panel}>
    <div className={LIVE_BOARD.schedule}>
      <div className={LIVE_BOARD.moment}>
        <span className={LIVE_BOARD.momentLabel}>
          {isLive ? LIVE_COPY.startedAt : LIVE_COPY.startsAt}
        </span>
        <span className={cn(LIVE_BOARD.momentClock, isLive && LIVE_BOARD.momentClockLive)}>
          {formatClock(start)}
        </span>
        <span className={LIVE_BOARD.momentDay}>{formatRelativeDay(start)}</span>
      </div>

      <div className={LIVE_BOARD.span} aria-hidden={!end}>
        <span className={LIVE_BOARD.spanLine} />
        {end && <span>{formatSpan(start, end)}</span>}
      </div>

      <div className={cn(LIVE_BOARD.moment, LIVE_BOARD.momentEnd)}>
        <span className={LIVE_BOARD.momentLabel}>{LIVE_COPY.endsAt}</span>
        <span className={LIVE_BOARD.momentClock}>{formatClock(end)}</span>
        <span className={LIVE_BOARD.momentDay}>{end ? formatRelativeDay(end) : ''}</span>
      </div>
    </div>
  </div>
)
