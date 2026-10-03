'use client'

import { useMemo, useState } from 'react'

import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ABSENCE_PAGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { monthGrid, toDayKey } from '@/utils/format/calendar'
import { addMonths, monthLabel, parseDay, startOfMonth } from '@/utils/format/days'

// Days of a week, a month row is dropped when none of its days belongs to the month
const WEEK = 7

export interface AbsenceSpan {
  start: string
  end: string
}

export interface AbsenceCalendarProps {
  // Days picked so far: both once the range is closed, only the first while it is open
  start: string | null
  end: string | null
  // Absences already declared, drawn hatched and out of reach
  booked: AbsenceSpan[]
  onChange: (start: string | null, end: string | null) => void
}

/**
 * One month to pick the first and the last day of an absence. The first click
 * opens the range, the second closes it, a third starts over. Days behind and days already
 * covered by another absence cannot be picked
 * @param {string | null} start - First day picked
 * @param {string | null} end - Last day picked
 * @param {AbsenceSpan[]} booked - Absences already declared
 * @param {(start: string | null, end: string | null) => void} onChange - Selection handler
 * @return {JSX.Element}
 */

export const AbsenceCalendar = ({ start, end, booked, onChange }: AbsenceCalendarProps) => {
  const [cursor, setCursor] = useState(() => toDayKey(startOfMonth(new Date())))
  const [preview, setPreview] = useState<string | null>(null)

  const Previous = ICONS.back
  const Next = ICONS.forward
  const today = toDayKey(new Date())

  const month = useMemo(() => {
    const cells = monthGrid(cursor)
    const weeks = Array.from({ length: cells.length / WEEK }, (_, row) =>
      cells.slice(row * WEEK, (row + 1) * WEEK)
    ).filter((week) => week.some((cell) => cell.isCurrentMonth))

    return { label: monthLabel(parseDay(cursor)), weeks }
  }, [cursor])

  const isBooked = (day: string) => booked.some((span) => span.start <= day && day <= span.end)

  const pick = (day: string) => {
    if (!start || end) return onChange(day, null)
    if (day < start) return onChange(day, start)

    return onChange(start, day)
  }

  // While the range is open, the days up to the pointer are drawn as if it were closed
  const rangeEnd = end ?? (preview && start && preview >= start ? preview : null)

  return (
    <div className={ABSENCE_PAGE.months}>
      <div className={ABSENCE_PAGE.month}>
        <div className={ABSENCE_PAGE.monthHead}>
          <button
            type="button"
            className={ABSENCE_PAGE.monthNav}
            aria-label={PICKER_COPY.previousMonth}
            onClick={() => setCursor(toDayKey(addMonths(parseDay(cursor), -1)))}
          >
            <Previous className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className={ABSENCE_PAGE.monthName}>{month.label}</span>
          <button
            type="button"
            className={ABSENCE_PAGE.monthNav}
            aria-label={PICKER_COPY.nextMonth}
            onClick={() => setCursor(toDayKey(addMonths(parseDay(cursor), 1)))}
          >
            <Next className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className={ABSENCE_PAGE.grid} onPointerLeave={() => setPreview(null)}>
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className={ABSENCE_PAGE.weekday}>
              {label.replace('.', '')}
            </span>
          ))}
          {month.weeks.flat().map((cell) => {
            if (!cell.isCurrentMonth) return <span key={cell.key} />

            const past = cell.key < today
            const taken = isBooked(cell.key)
            const isEdge = cell.key === start || cell.key === (end ?? null)
            const inRange = start && rangeEnd && cell.key > start && cell.key < rangeEnd
            const isPreview = !end && inRange

            return (
              <button
                key={cell.key}
                type="button"
                disabled={past || taken}
                aria-pressed={isEdge}
                onClick={() => pick(cell.key)}
                onPointerEnter={() => setPreview(cell.key)}
                className={cn(
                  ABSENCE_PAGE.day,
                  past
                    ? ABSENCE_PAGE.dayPast
                    : taken
                      ? ABSENCE_PAGE.dayBooked
                      : !isEdge && ABSENCE_PAGE.dayFree,
                  cell.isToday && !isEdge && ABSENCE_PAGE.dayToday,
                  inRange && (isPreview ? ABSENCE_PAGE.dayPreview : ABSENCE_PAGE.dayRange),
                  isEdge && ABSENCE_PAGE.dayEdge
                )}
              >
                {cell.dayOfMonth}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
