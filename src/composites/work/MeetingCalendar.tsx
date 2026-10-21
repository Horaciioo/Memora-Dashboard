'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/page/Section'
import { CALENDAR_COPY, ANNUAL_REVIEW_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import { MEETING_CALENDAR } from '@/declarations/ui/variants'
import type { MeetingCalendarView } from '@/types/work'
import { cn } from '@/utils/classnames'
import { monthGrid, periodLabel, shiftAnchor, toDayKey } from '@/utils/format/calendar'
import { formatDayTime } from '@/utils/format/dates'

export interface MeetingCalendarProps {
  view: MeetingCalendarView
}

/**
 * Where a meeting sits on the calendar: its entry, or the period holding its slots in a small month
 * @param {MeetingCalendarView} view - One entry, or a period with the slots of each day
 * @return {JSX.Element}
 */

export const MeetingCalendar = ({ view }: MeetingCalendarProps) => {
  const router = useRouter()
  const [anchor, setAnchor] = useState(() => toDayKey(view.startsAt))

  const seeEntry = () => router.push(ROUTES.calendarEvent(view.entryId ?? ''))

  if (view.shape === 'single') {
    return (
      <Section title={ANNUAL_REVIEW_COPY.inCalendar}>
        <div className={MEETING_CALENDAR.card}>
          <span className={MEETING_CALENDAR.cardWhen}>{formatDayTime(view.startsAt)}</span>
          <Button onClick={seeEntry}>{ANNUAL_REVIEW_COPY.seeInCalendar}</Button>
        </div>
      </Section>
    )
  }

  const first = toDayKey(view.startsAt)
  const last = toDayKey(view.endsAt ?? view.startsAt)
  const counts = new Map(view.days.map((entry) => [entry.day, entry]))

  return (
    <Section
      title={ANNUAL_REVIEW_COPY.periodCalendar}
      action={<Button onClick={seeEntry}>{ANNUAL_REVIEW_COPY.seeInCalendar}</Button>}
      bare
    >
      <div className={MEETING_CALENDAR.panel}>
        <div className={MEETING_CALENDAR.head}>
          <span className={MEETING_CALENDAR.title}>{periodLabel(anchor, 'month')}</span>
          <span className={MEETING_CALENDAR.steps}>
            <button
              type="button"
              aria-label={CALENDAR_COPY.previous}
              className={MEETING_CALENDAR.step}
              onClick={() => setAnchor(shiftAnchor(anchor, 'month', -1))}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={CALENDAR_COPY.next}
              className={MEETING_CALENDAR.step}
              onClick={() => setAnchor(shiftAnchor(anchor, 'month', 1))}
            >
              ›
            </button>
          </span>
        </div>
        <div className={MEETING_CALENDAR.grid}>
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className={MEETING_CALENDAR.weekday}>
              {label[0]}
            </span>
          ))}
          {monthGrid(anchor).map((day) => {
            const count = counts.get(day.key)

            return (
              <button
                key={day.key}
                type="button"
                className={cn(
                  MEETING_CALENDAR.day,
                  !day.isCurrentMonth && MEETING_CALENDAR.dayOutside,
                  day.key >= first && day.key <= last && MEETING_CALENDAR.dayInPeriod,
                  day.isToday && MEETING_CALENDAR.dayToday
                )}
                onClick={() => router.push(ROUTES.calendarDay(day.key))}
              >
                {day.dayOfMonth}
                {count && (
                  <span className={MEETING_CALENDAR.dayCount}>
                    {ANNUAL_REVIEW_COPY.slotsCount
                      .replace('{taken}', String(count.taken))
                      .replace('{total}', String(count.total))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
