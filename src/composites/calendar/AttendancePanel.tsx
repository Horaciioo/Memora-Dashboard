'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { AttendancePerson, CalendarEntry } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export interface AttendancePanelProps {
  entry: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName) => void
  onRemind: () => void
}

// Order the standings read in, no-answers last
const GROUPS: AttendanceStatusName[] = [
  AttendanceStatuses.Present,
  AttendanceStatuses.Absent,
  AttendanceStatuses.Pending,
]

const RollCallIcon = ICONS.meetings

/**
 * Roll-call block of the detail modal — the viewer's own answer, the head count, and the
 * name lists once they are open to them
 * @param {CalendarEntry} entry - Roll-call entry on screen
 * @param {boolean} pending - A mutation is in flight
 * @param {(status: AttendanceStatusName) => void} onRespond - Send Present or Absent
 * @param {() => void} onRemind - Ping the no-answers now
 * @return {JSX.Element | null}
 */

export const AttendancePanel = ({ entry, pending, onRespond, onRemind }: AttendancePanelProps) => {
  const roster = entry.attendance
  if (!roster) return null

  const people: Record<AttendanceStatusName, AttendancePerson[]> = {
    [AttendanceStatuses.Present]: roster.present,
    [AttendanceStatuses.Absent]: roster.absent,
    [AttendanceStatuses.Pending]: roster.pending,
  }

  const count: Record<AttendanceStatusName, number> = {
    [AttendanceStatuses.Present]: roster.counts.present,
    [AttendanceStatuses.Absent]: roster.counts.absent,
    [AttendanceStatuses.Pending]: roster.counts.pending,
  }

  return (
    <section className={CALENDAR_STYLES.rollCall}>
      <span className={CALENDAR_STYLES.rollCallHead}>
        <RollCallIcon className={CALENDAR_STYLES.chipMark} aria-hidden="true" />
        {CALENDAR_COPY.rollCallTitle}
      </span>

      {roster.mine !== null && (
        <div className={CALENDAR_STYLES.rollCallAnswer}>
          <Button
            variant={roster.mine === AttendanceStatuses.Present ? 'primary' : 'secondary'}
            icon="confirm"
            disabled={pending}
            onClick={() => onRespond(AttendanceStatuses.Present)}
          >
            {CALENDAR_COPY.respondPresent}
          </Button>
          <Button
            variant={roster.mine === AttendanceStatuses.Absent ? 'danger' : 'secondary'}
            icon="close"
            disabled={pending}
            onClick={() => onRespond(AttendanceStatuses.Absent)}
          >
            {CALENDAR_COPY.respondAbsent}
          </Button>
        </div>
      )}

      <div className={CALENDAR_STYLES.rollCallCounts}>
        {GROUPS.map((status) => (
          <Badge
            key={status}
            label={`${ATTENDANCE_STATUS_REGISTRY.get(status).label} · ${count[status]}`}
            tone={ATTENDANCE_STATUS_REGISTRY.get(status).tone}
            icon={ATTENDANCE_STATUS_REGISTRY.get(status).icon}
          />
        ))}
      </div>

      {roster.visible ? (
        <div className={CALENDAR_STYLES.rollCallLists}>
          {GROUPS.filter((status) => people[status].length > 0).map((status) => (
            <div key={status} className={CALENDAR_STYLES.rollCallGroup}>
              <span className={CALENDAR_STYLES.legendTitle}>
                {ATTENDANCE_STATUS_REGISTRY.get(status).label}
              </span>
              <div className={CALENDAR_STYLES.rollCallPeople}>
                {people[status].map((person) => (
                  <span key={person.name} className={CALENDAR_STYLES.rollCallPerson}>
                    <Avatar name={person.name} src={person.avatar} size="sm" />
                    {person.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.rosterHidden}</p>
      )}

      {roster.canManage && (
        <Button
          variant="ghost"
          icon="bell"
          disabled={pending || roster.counts.pending === 0}
          onClick={onRemind}
        >
          {CALENDAR_COPY.remindPending}
        </Button>
      )}
    </section>
  )
}
