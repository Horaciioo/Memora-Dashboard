'use client'

import { useMemo } from 'react'
import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DATE_PICKER_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { monthGrid, periodLabel, shiftAnchor } from '@/utils/format/calendar'

export interface DayGridProps {
  // Any day of the month on screen
  cursor: string
  onCursor: (cursor: string) => void
  // Single value
  day: string
  // Days before it cannot be picked
  minDay?: string
  // Highlighted span
  span: [string, string] | null
  range: boolean
  // Plain click, or first click of a range
  onPick: (day: string) => void
  onHover: (day: string) => void
  isAnchored: boolean
  // Opens the month and year wheels
  onTitle: () => void
}

/**
 * Month grid with its header
 * @param {DayGridProps} props - Month, selection and gestures
 * @return {JSX.Element}
 */

export const DayGrid = ({
  cursor,
  onCursor,
  day,
  minDay,
  span,
  range,
  onPick,
  onHover,
  isAnchored,
  onTitle,
}: DayGridProps) => {
  const days = useMemo(() => monthGrid(cursor), [cursor])
  const PreviousIcon = ICONS.back
  const NextIcon = ICONS.forward

  return (
    <>
      <div className={DATE_PICKER_STYLES.head}>
        <button
          type="button"
          aria-label={PICKER_COPY.previousMonth}
          className={DATE_PICKER_STYLES.step}
          onClick={() => onCursor(shiftAnchor(cursor, 'month', -1))}
        >
          <PreviousIcon className={DATE_PICKER_STYLES.stepIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={PICKER_COPY.pickYear}
          className={DATE_PICKER_STYLES.monthPick}
          onClick={onTitle}
        >
          {periodLabel(cursor, 'month')}
        </button>
        <button
          type="button"
          aria-label={PICKER_COPY.nextMonth}
          className={DATE_PICKER_STYLES.step}
          onClick={() => onCursor(shiftAnchor(cursor, 'month', 1))}
        >
          <NextIcon className={DATE_PICKER_STYLES.stepIcon} aria-hidden="true" />
        </button>
      </div>

      <div className={DATE_PICKER_STYLES.weekdays}>
        {WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className={cn(DATE_PICKER_STYLES.grid, range && 'select-none')}>
        {days.map((entry) => {
          const within = span !== null && entry.key >= span[0] && entry.key <= span[1]
          const isStart = span !== null && entry.key === span[0]
          const isEnd = span !== null && entry.key === span[1]
          const isEdge = isStart || isEnd
          const isBarred = minDay !== undefined && entry.key < minDay

          return (
            <button
              key={entry.key}
              type="button"
              disabled={isBarred}
              aria-pressed={range ? within : entry.key === day}
              className={cn(
                DATE_PICKER_STYLES.day,
                !entry.isCurrentMonth && DATE_PICKER_STYLES.dayOutside,
                isBarred && DATE_PICKER_STYLES.dayBarred,
                entry.isToday && DATE_PICKER_STYLES.dayToday,
                !range && entry.key === day && DATE_PICKER_STYLES.daySelected,
                within && !isEdge && DATE_PICKER_STYLES.dayInRange,
                range && isEdge && DATE_PICKER_STYLES.daySelected,
                isStart && !isEnd && DATE_PICKER_STYLES.dayRangeStart,
                isEnd && !isStart && DATE_PICKER_STYLES.dayRangeEnd
              )}
              onClick={range ? undefined : () => onPick(entry.key)}
              onPointerDown={range ? () => onPick(entry.key) : undefined}
              onPointerEnter={range && isAnchored ? () => onHover(entry.key) : undefined}
              onKeyDown={
                range
                  ? (event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return

                      event.preventDefault()
                      onPick(entry.key)
                    }
                  : undefined
              }
            >
              {entry.dayOfMonth}
            </button>
          )
        })}
      </div>
    </>
  )
}
