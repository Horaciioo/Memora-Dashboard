import Link from 'next/link'

import { StatusText } from '@/components/elements/display/StatusText'
import { Glyph } from '@/components/elements/display/Glyph'
import { Section } from '@/components/structures/Section'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import type { PendingRollCall } from '@/core/services/calendar/attendance'
import { HOME_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
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
  <Section title={PERSONAL_COPY.attendanceTitle} bare>
    <ul className={HOME_STYLES.rows}>
      {items.map((item) => {
        const status = ATTENDANCE_STATUS_REGISTRY.get(item.status)

        return (
          <li key={item.eventId}>
            <Link
              href={ROUTES.calendarEvent(item.eventId)}
              className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}
            >
              <span className={HOME_STYLES.chip}>
                <Glyph value={item.emoji} size="chip" />
              </span>
              <span className={HOME_STYLES.rowBody}>
                <span className={HOME_STYLES.rowTitle}>{item.title}</span>
                <span className={HOME_STYLES.rowMeta}>{formatDayTime(item.startsAt)}</span>
              </span>
              <StatusText label={status.label} accent={status.tone} />
            </Link>
          </li>
        )
      })}
    </ul>
  </Section>
)
