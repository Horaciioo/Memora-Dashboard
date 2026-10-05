import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock, formatRelativeDay } from '@/utils/format/dates'

export interface LiveScheduleProps {
  isLive: boolean
  start: string
  end: string | null
}

/**
 * Start and end times
 * @param {boolean} isLive - Live runs
 * @param {string} start - Start instant
 * @param {string | null} end - Planned end
 * @return {JSX.Element}
 */

export const LiveSchedule = ({ isLive, start, end }: LiveScheduleProps) => (
  <>
    <div className={LIVE_BOARD.fact}>
      <span className={LIVE_BOARD.factLabel}>
        {isLive ? LIVE_COPY.startedAt : LIVE_COPY.startsAt}
      </span>
      <span className={cn(LIVE_BOARD.factClock, isLive && LIVE_BOARD.factClockLive)}>
        {formatClock(start)}
      </span>
      <span className={LIVE_BOARD.factDay}>{formatRelativeDay(start)}</span>
    </div>
    <span className={LIVE_BOARD.factDivider} aria-hidden="true" />
    <div className={LIVE_BOARD.fact}>
      <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.endsAt}</span>
      <span className={LIVE_BOARD.factClock}>{formatClock(end)}</span>
      <span className={LIVE_BOARD.factDay}>{end ? formatRelativeDay(end) : ''}</span>
    </div>
  </>
)
