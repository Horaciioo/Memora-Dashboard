import Link from 'next/link'

import { Badge } from '@/components/elements/display/Badge'
import { Glyph } from '@/components/elements/display/Glyph'
import { Section } from '@/components/structures/Section'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import type { PendingRollCall } from '@/core/services/calendar/attendance'
import { formatDayTime } from '@/utils/format/dates'

export interface AttendanceInboxProps {
  items: PendingRollCall[]
}

/**
 * Upcoming roll-calls that still want the signed-in member's answer, each row a way straight
 * to the calendar modal that carries the Present and Absent buttons
 * @param {PendingRollCall[]} items - Roll-calls concerning the member
 * @return {JSX.Element}
 */

export const AttendanceInbox = ({ items }: AttendanceInboxProps) => (
  <Section title={PERSONAL_COPY.attendanceTitle} description={PERSONAL_COPY.attendanceLead}>
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const status = ATTENDANCE_STATUS_REGISTRY.get(item.status)

        return (
          <li key={item.eventId}>
            <Link
              href={ROUTES.calendarEvent(item.eventId)}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface)]"
            >
              <Glyph value={item.emoji} size="chip" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.title}</span>
                <span className="text-xs text-[var(--color-ink-subtle)]">
                  {formatDayTime(item.startsAt)}
                </span>
              </span>
              <Badge label={status.label} tone={status.tone} icon={status.icon} />
            </Link>
          </li>
        )
      })}
    </ul>
  </Section>
)
