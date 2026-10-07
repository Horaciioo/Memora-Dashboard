'use client'

import { useState, type CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_DETAIL, CALENDAR_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { AttendancePerson, CalendarEntry } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export interface AttendancePanelProps {
  entry: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName) => void
  onRemind: () => void
}

// Order the standings read in
const GROUPS: AttendanceStatusName[] = [
  AttendanceStatuses.Present,
  AttendanceStatuses.Absent,
  AttendanceStatuses.Pending,
]

const ChevronIcon = ICONS.expand

/**
 * Roll-call blocks of the detail modal, the viewer's answer then the roster
 * @param {CalendarEntry} entry - Roll-call entry on screen
 * @param {boolean} pending - A mutation is in flight
 * @param {(status: AttendanceStatusName) => void} onRespond - Send Present or Absent
 * @param {() => void} onRemind - Ping the no-answers now
 * @return {JSX.Element | null}
 */

export const AttendancePanel = ({ entry, pending, onRespond, onRemind }: AttendancePanelProps) => {
  // Closed on arrival, the answer comes first
  const [isOpen, setIsOpen] = useState(false)
  const roster = entry.attendance
  if (!roster) return null

  const people: Record<AttendanceStatusName, AttendancePerson[]> = {
    [AttendanceStatuses.Present]: roster.present,
    [AttendanceStatuses.Absent]: roster.absent,
    [AttendanceStatuses.Pending]: roster.pending,
  }

  return (
    <>
      {roster.mine !== null && (
        <section className={CALENDAR_DETAIL.section}>
          <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.yourPresence}</h3>
          <div className={CALENDAR_DETAIL.card}>
            <p className={CALENDAR_STYLES.detailNote}>
              {roster.mine === AttendanceStatuses.Pending
                ? CALENDAR_COPY.noAnswerYet
                : CALENDAR_COPY.answerSaved}
            </p>
            <div className={CALENDAR_DETAIL.answer}>
              <Button
                variant={roster.mine === AttendanceStatuses.Present ? 'primary' : 'secondary'}
                disabled={pending}
                className="flex-1"
                onClick={() => onRespond(AttendanceStatuses.Present)}
              >
                {CALENDAR_COPY.respondPresent}
              </Button>
              <Button
                variant={roster.mine === AttendanceStatuses.Absent ? 'danger' : 'secondary'}
                disabled={pending}
                className="flex-1"
                onClick={() => onRespond(AttendanceStatuses.Absent)}
              >
                {CALENDAR_COPY.respondAbsent}
              </Button>
            </div>
          </div>
        </section>
      )}

      {roster.visible && (
        <section className={CALENDAR_DETAIL.section}>
          <button
            type="button"
            aria-expanded={isOpen}
            className={CALENDAR_DETAIL.foldToggle}
            onClick={() => setIsOpen((current) => !current)}
          >
            <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.rollCallTitle}</h3>
            <ChevronIcon
              className={cn(
                CALENDAR_DETAIL.foldChevron,
                !isOpen && CALENDAR_DETAIL.foldChevronShut
              )}
              aria-hidden="true"
            />
          </button>

          <div
            className={cn(CALENDAR_DETAIL.fold, isOpen && CALENDAR_DETAIL.foldOpen)}
            data-open={isOpen}
            aria-hidden={!isOpen}
            inert={!isOpen}
          >
            <div className={CALENDAR_DETAIL.foldInner}>
              <div className={CALENDAR_DETAIL.card}>
                <div className={CALENDAR_DETAIL.columns}>
                  {GROUPS.map((status) => {
                    const option = ATTENDANCE_STATUS_REGISTRY.get(status)

                    return (
                      <div key={status} className={CALENDAR_STYLES.rollCallGroup}>
                        <span
                          className={CALENDAR_DETAIL.foldItem}
                          style={{ '--i': 0 } as CSSProperties}
                        >
                          <Status label={option.label} tone={option.tone} icon={option.icon} />
                        </span>
                        {people[status].length === 0 ? (
                          <span
                            className={cn(CALENDAR_DETAIL.none, CALENDAR_DETAIL.foldItem)}
                            style={{ '--i': 1 } as CSSProperties}
                          >
                            {CALENDAR_COPY.nobody}
                          </span>
                        ) : (
                          <div className={CALENDAR_STYLES.rollCallPeople}>
                            {people[status].map((person, index) => (
                              <span
                                key={person.name}
                                className={cn(
                                  CALENDAR_STYLES.rollCallPerson,
                                  CALENDAR_DETAIL.foldItem
                                )}
                                style={{ '--i': index + 1 } as CSSProperties}
                              >
                                <Avatar name={person.name} src={person.avatar} size="sm" />
                                {person.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className={CALENDAR_DETAIL.foldDivider}>
                  <Button
                    variant="ghost"
                    disabled={pending || roster.counts.pending === 0}
                    onClick={onRemind}
                  >
                    {CALENDAR_COPY.remindPending}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
