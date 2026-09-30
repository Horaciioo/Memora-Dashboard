import { Button } from '@/components/elements/actions/Button'
import { CALENDAR_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { CALENDAR_SIDEBAR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { periodLabel, shiftAnchor, unitGrid } from '@/utils/format/calendar'

export interface CalendarMiniMonthProps {
  cursor: string
  onPick: (dayKey: string) => void
  onCursor: (dayKey: string) => void
}

/**
 * The month of the cursor in miniature, a day jumping the grid onto it
 * @param {string} cursor - ISO day the grid is anchored on
 * @param {(dayKey: string) => void} onPick - Called with the chosen day
 * @param {(dayKey: string) => void} onCursor - Called with the day a month step lands on
 * @return {JSX.Element}
 */

export const CalendarMiniMonth = ({ cursor, onPick, onCursor }: CalendarMiniMonthProps) => (
  <div className={CALENDAR_SIDEBAR.mini}>
    <div className={CALENDAR_SIDEBAR.miniHead}>
      <span className={CALENDAR_SIDEBAR.miniTitle}>{periodLabel(cursor, 'month')}</span>
      <span className="flex items-center">
        <Button
          variant="icon"
          icon="back"
          aria-label={CALENDAR_COPY.previous}
          onClick={() => onCursor(shiftAnchor(cursor, 'month', -1))}
        />
        <Button
          variant="icon"
          icon="forward"
          aria-label={CALENDAR_COPY.next}
          onClick={() => onCursor(shiftAnchor(cursor, 'month', 1))}
        />
      </span>
    </div>

    <div className={CALENDAR_SIDEBAR.miniGrid}>
      {WEEKDAY_LABELS.map((label) => (
        <span key={label} className={CALENDAR_SIDEBAR.miniWeekday}>
          {label[0]}
        </span>
      ))}
      {unitGrid(cursor, 'month').map((day) => (
        <button
          key={day.key}
          type="button"
          onClick={() => onPick(day.key)}
          className={cn(
            CALENDAR_SIDEBAR.miniDay,
            !day.isCurrentMonth && CALENDAR_SIDEBAR.miniDayOutside,
            day.key === cursor && CALENDAR_SIDEBAR.miniDayPicked,
            day.isToday && CALENDAR_SIDEBAR.miniDayToday
          )}
        >
          {day.dayOfMonth}
        </button>
      ))}
    </div>
  </div>
)
