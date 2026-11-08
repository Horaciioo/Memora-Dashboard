'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import {
  BOARD_STYLES,
  CALENDAR_DETAIL,
  CALENDAR_STYLES,
  SECTION_STYLES,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'
import type { AttendancePerson, CalendarEntry } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export interface AttendanceRosterProps {
  entry: CalendarEntry
  pending: boolean
  onMove: (accountId: string, status: AttendanceStatusName) => void
  onRemind: () => void
}

// Order the standings read in
const GROUPS: AttendanceStatusName[] = [
  AttendanceStatuses.Present,
  AttendanceStatuses.Absent,
  AttendanceStatuses.Pending,
]

/**
 * Roll-call standings, names landing one after the other
 * @param {CalendarEntry} entry - Roll-call entry on screen
 * @param {boolean} pending - A mutation is in flight
 * @param {(accountId: string, status: AttendanceStatusName) => void} onMove - Move a name to another column
 * @param {() => void} onRemind - Ping the no-answers now
 * @return {JSX.Element | null}
 */

export const AttendanceRoster = ({ entry, pending, onMove, onRemind }: AttendanceRosterProps) => {
  // Flips on arrival so the names can land
  const [isReady, setReady] = useState(false)
  const { dragged, over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    if (item.from !== container) onMove(item.id, container as AttendanceStatusName)
  })

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  const roster = entry.attendance
  if (!roster?.visible) return null

  const people: Record<AttendanceStatusName, AttendancePerson[]> = {
    [AttendanceStatuses.Present]: roster.present,
    [AttendanceStatuses.Absent]: roster.absent,
    [AttendanceStatuses.Pending]: roster.pending,
  }

  // Each group starts its stagger after the previous one
  const starts = GROUPS.map((_, group) =>
    GROUPS.slice(0, group).reduce(
      (total, status) => total + 1 + Math.max(people[status].length, 1),
      0
    )
  )

  return (
    <section className={CALENDAR_DETAIL.section}>
      <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.rollCallTitle}</h3>
      <div className={cn(CALENDAR_DETAIL.card, 'group/roll')} data-ready={isReady}>
        <div className={CALENDAR_DETAIL.columns}>
          {GROUPS.map((status, group) => {
            const option = ATTENDANCE_STATUS_REGISTRY.get(status)
            const Icon = ICONS[option.icon]

            return (
              <div
                key={status}
                className={cn(
                  CALENDAR_STYLES.rollCallGroup,
                  BOARD_STYLES.columnTint,
                  roster.canManage && CALENDAR_STYLES.rollCallDrop,
                  roster.canManage && over === status && CALENDAR_STYLES.rollCallOver
                )}
                style={accentVars(option.tone)}
                {...(roster.canManage ? containerProps(status) : {})}
              >
                <span
                  className={cn('self-start', CALENDAR_DETAIL.rollItem)}
                  style={{ '--i': starts[group] } as CSSProperties}
                >
                  <span className={CALENDAR_STYLES.rollCallTitle}>
                    <Icon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                    {option.label}
                  </span>
                </span>
                {people[status].length === 0 ? (
                  <span
                    className={cn(CALENDAR_DETAIL.none, CALENDAR_DETAIL.rollItem)}
                    style={{ '--i': starts[group] + 1 } as CSSProperties}
                  >
                    {CALENDAR_COPY.nobody}
                  </span>
                ) : (
                  <div className={CALENDAR_STYLES.rollCallPeople}>
                    {people[status].map((person, index) => (
                      <span
                        key={person.id}
                        className={cn(
                          CALENDAR_STYLES.rollCallPerson,
                          CALENDAR_DETAIL.rollItem,
                          roster.canManage && CALENDAR_STYLES.rollCallMovable,
                          dragged?.id === person.id && CALENDAR_STYLES.rollCallDragged
                        )}
                        style={{ '--i': starts[group] + index + 1 } as CSSProperties}
                        {...(roster.canManage ? itemProps({ id: person.id, from: status }) : {})}
                      >
                        <Avatar name={person.name} src={person.avatar} size="xs" />
                        <span className={CALENDAR_STYLES.rollCallName}>
                          <span className="flex max-w-full items-center gap-1 font-medium">
                            <span className="min-w-0 break-words">{person.name}</span>
                            {person.isReinforcement && <ReinforcementTag />}
                          </span>
                          {person.hours && (
                            <span className={CALENDAR_STYLES.rollCallHours}>
                              {CALENDAR_COPY.hoursRange
                                .replace('{from}', formatClock(person.hours.from))
                                .replace('{to}', formatClock(person.hours.to))}
                            </span>
                          )}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={CALENDAR_DETAIL.divider}>
          <Button
            variant="ghost"
            disabled={pending || roster.counts.pending === 0}
            onClick={onRemind}
          >
            {CALENDAR_COPY.remindPending}
          </Button>
        </div>
      </div>
    </section>
  )
}
