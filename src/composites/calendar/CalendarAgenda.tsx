'use client'

import { Glyph } from '@/components/elements/display/glyphs/Glyph'
import { CALENDAR_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_AGENDA, HOME_PLAN } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import type { CalendarDay } from '@/utils/format/calendar'
import { coversDay, timeOf, weekdayOf } from '@/utils/format/calendar'
import { monthLabel, parseDay } from '@/utils/format/time/days'

export interface CalendarAgendaProps {
  days: CalendarDay[]
  entries: CalendarEntry[]
  selection: string[]
  onOpen: (entry: CalendarEntry, additive: boolean) => void
  // Day heads dropped when the frame already names the day
  headless?: boolean
}

// Same rows as the home planning
const SpotIcon = ICONS.meetings
const ChevronIcon = ICONS.next

/**
 * Planning
 * @param {CalendarDay[]} days - Days the planning spans
 * @param {CalendarEntry[]} entries - Entries drawn
 * @param {string[]} selection - Selected entry identifiers
 * @param {(entry: CalendarEntry, additive: boolean) => void} onOpen - Open or select handler
 * @param {boolean} [headless] - Hide the day heads
 * @return {JSX.Element}
 */

export const CalendarAgenda = ({
  days,
  entries,
  selection,
  onOpen,
  headless,
}: CalendarAgendaProps) => {
  const filled = days
    .map((day) => ({
      day,
      // Whole days first
      items: entries
        .filter((entry) => coversDay(entry.startsAt, entry.endsAt, day.key))
        .sort(
          (left, right) =>
            Number(right.allDay) - Number(left.allDay) ||
            left.startsAt.localeCompare(right.startsAt)
        ),
    }))
    .filter((entry) => entry.items.length > 0)

  if (filled.length === 0)
    return <p className={CALENDAR_AGENDA.empty}>{CALENDAR_COPY.agendaEmpty}</p>

  return (
    <div className={CALENDAR_AGENDA.list}>
      {filled.map(({ day, items }) => (
        <section key={day.key} className={CALENDAR_AGENDA.day}>
          {!headless && (
            <header className={CALENDAR_AGENDA.head}>
              <span
                className={cn(CALENDAR_AGENDA.number, day.isToday && CALENDAR_AGENDA.numberToday)}
              >
                {day.dayOfMonth}
              </span>
              <span className={CALENDAR_AGENDA.weekday}>
                {WEEKDAY_LABELS[weekdayOf(day.key)]}
                <span className={CALENDAR_AGENDA.month}>{monthLabel(parseDay(day.key))}</span>
              </span>
            </header>
          )}
          <div className={CALENDAR_AGENDA.rows}>
            {items.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={selection.includes(entry.id)}
                onClick={(event) => onOpen(entry, event.shiftKey || event.metaKey || event.ctrlKey)}
                className={cn(
                  HOME_PLAN.row,
                  CALENDAR_AGENDA.row,
                  selection.includes(entry.id) && CALENDAR_AGENDA.rowSelected
                )}
              >
                {entry.emoji ? (
                  <Glyph value={entry.emoji} size="row" />
                ) : (
                  <SpotIcon className={HOME_PLAN.glyph} aria-hidden="true" />
                )}
                <span className={HOME_PLAN.title}>{entry.title}</span>
                {!entry.allDay && (
                  <span className={CALENDAR_AGENDA.time}>{timeOf(entry.startsAt)}</span>
                )}
                <ChevronIcon className={HOME_PLAN.chevron} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
