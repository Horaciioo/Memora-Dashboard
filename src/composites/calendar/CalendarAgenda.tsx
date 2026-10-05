'use client'

import { Glyph } from '@/components/elements/display/Glyph'
import { CALENDAR_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_AGENDA } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import type { CalendarDay } from '@/utils/format/calendar'
import { coversDay, timeOf, weekdayOf } from '@/utils/format/calendar'
import { monthLabel, parseDay } from '@/utils/format/days'

export interface CalendarAgendaProps {
  days: CalendarDay[]
  entries: CalendarEntry[]
  selection: string[]
  onOpen: (entry: CalendarEntry, additive: boolean) => void
}

/**
 * Planning
 * @param {CalendarDay[]} days - Days the planning spans
 * @param {CalendarEntry[]} entries - Entries drawn
 * @param {string[]} selection - Selected entry identifiers
 * @param {(entry: CalendarEntry, additive: boolean) => void} onOpen - Open or select handler
 * @return {JSX.Element}
 */

export const CalendarAgenda = ({ days, entries, selection, onOpen }: CalendarAgendaProps) => {
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
          <div className={CALENDAR_AGENDA.rows}>
            {items.map((entry) => {
              const paint = accentPaint(entry.accent, entry.muted ? 'neutral' : 'brand')
              const source = CALENDAR_SOURCE_REGISTRY.get(entry.source)

              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={selection.includes(entry.id)}
                  onClick={(event) =>
                    onOpen(entry, event.shiftKey || event.metaKey || event.ctrlKey)
                  }
                  className={cn(
                    CALENDAR_AGENDA.row,
                    selection.includes(entry.id) && CALENDAR_AGENDA.rowSelected
                  )}
                >
                  <span className={cn('inline-flex', paint.text)} style={paint.style}>
                    <span className={CALENDAR_AGENDA.bullet} aria-hidden="true" />
                  </span>
                  <span className={CALENDAR_AGENDA.time}>
                    {entry.allDay ? CALENDAR_COPY.allDayRow : timeOf(entry.startsAt)}
                  </span>
                  <span className={CALENDAR_AGENDA.title}>
                    <Glyph value={entry.emoji} size="chip" /> {entry.title}
                  </span>
                  <span className={CALENDAR_AGENDA.meta}>{entry.subjectName ?? source.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
