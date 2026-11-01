import type { StatusDay } from '@/core/services/system/StatusService'
import { STATUS_COPY } from '@/declarations/system/monitoring/status'
import { STATUS_BAR_COLOURS, STATUS_HISTORY_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Days kept near each edge
const EDGE_DAYS = 12

// Popup anchor per position
const popAnchor = (index: number, total: number): string => {
  if (index < EDGE_DAYS) return STATUS_HISTORY_STYLES.popStart
  if (index >= total - EDGE_DAYS) return STATUS_HISTORY_STYLES.popEnd

  return STATUS_HISTORY_STYLES.popCenter
}

/**
 * Daily bars with popup
 * @param {StatusDay[]} days - Oldest first
 * @param {number | null} uptime - Percent
 * @return {JSX.Element}
 */

export const StatusBars = ({ days, uptime }: { days: StatusDay[]; uptime: number | null }) => (
  <>
    <div className={STATUS_HISTORY_STYLES.bars}>
      {days.map(({ day, health }, index) => (
        <span key={day} className={STATUS_HISTORY_STYLES.column}>
          <span className={cn(STATUS_HISTORY_STYLES.bar, STATUS_BAR_COLOURS[health ?? 'none'])} />
          <span
            role="tooltip"
            className={cn(STATUS_HISTORY_STYLES.pop, popAnchor(index, days.length))}
          >
            <span className={STATUS_HISTORY_STYLES.popDay}>{formatDay(`${day}T12:00:00Z`)}</span>
            <span className={cn(STATUS_HISTORY_STYLES.popText, 'block')}>
              {health ? STATUS_COPY.dayLevel[health] : STATUS_COPY.noData}
            </span>
          </span>
        </span>
      ))}
    </div>
    <div className={STATUS_HISTORY_STYLES.axis}>
      <span>{STATUS_COPY.ago}</span>
      <span className={STATUS_HISTORY_STYLES.rule} />
      {uptime !== null && (
        <>
          <span>{`${uptime.toFixed(2)} % ${STATUS_COPY.uptime}`}</span>
          <span className={STATUS_HISTORY_STYLES.rule} />
        </>
      )}
      <span>{STATUS_COPY.today}</span>
    </div>
  </>
)
