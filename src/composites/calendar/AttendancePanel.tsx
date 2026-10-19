'use client'

import { useState, type CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import { AttendanceHoursDialog } from '@/composites/calendar/AttendanceHoursDialog'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { CALENDAR_DETAIL, CALENDAR_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'
import { initialHours } from '@/utils/format/hours'
import type { AttendancePerson, CalendarEntry } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export interface AttendancePanelProps {
  entry: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName, hours?: { from: string; to: string }) => void
  onMove: (accountId: string, status: AttendanceStatusName) => void
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
 * @param {(status: AttendanceStatusName, hours?: { from: string, to: string }) => void} onRespond - Send Present or Absent
 * @param {(accountId: string, status: AttendanceStatusName) => void} onMove - Move a name to another column
 * @param {() => void} onRemind - Ping the no-answers now
 * @return {JSX.Element | null}
 */

export const AttendancePanel = ({
  entry,
  pending,
  onRespond,
  onMove,
  onRemind,
}: AttendancePanelProps) => {
  // Closed on arrival, the answer comes first
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [isAskingHours, setAskingHours] = useState(false)
  const { dragged, over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    if (item.from !== container) onMove(item.id, container as AttendanceStatusName)
  })
  const roster = entry.attendance
  if (!roster) return null

  const isAnswered = roster.mine !== null && roster.mine !== AttendanceStatuses.Pending
  const isPresent = roster.mine === AttendanceStatuses.Present
  const AnswerIcon = ICONS[isPresent ? 'success' : 'failure']
  const answerTone = isPresent ? 'success' : 'danger'
  const answerCopy = isPresent ? CALENDAR_COPY.answeredPresent : CALENDAR_COPY.answeredAbsent

  // Leaving the answer view closes the change view
  const answer = (status: AttendanceStatusName, hours?: { from: string; to: string }) => {
    setIsChanging(false)
    setAskingHours(false)
    onRespond(status, hours)
  }

  // Hours are asked before a Present goes out
  const sayPresent = () =>
    roster.asksHours ? setAskingHours(true) : answer(AttendanceStatuses.Present)

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
            {isAnswered && !isChanging ? (
              <>
                <p className={CALENDAR_DETAIL.answered}>
                  <AnswerIcon
                    className={cn(CALENDAR_STYLES.previewIcon, TONES[answerTone].text)}
                    aria-hidden="true"
                  />
                  <span>
                    {answerCopy[0]}
                    <strong>{answerCopy[1]}</strong>
                    {answerCopy[2]}
                    {isPresent && roster.myHours && (
                      <span className={CALENDAR_STYLES.detailNote}>
                        {' '}
                        {CALENDAR_COPY.hoursRange
                          .replace('{from}', formatClock(roster.myHours.from))
                          .replace('{to}', formatClock(roster.myHours.to))}
                      </span>
                    )}
                  </span>
                </p>
                <Button variant="ghost" onClick={() => setIsChanging(true)}>
                  {CALENDAR_COPY.changeMind}
                </Button>
              </>
            ) : (
              <>
                {!isAnswered && (
                  <p className={CALENDAR_STYLES.detailNote}>{CALENDAR_COPY.noAnswerYet}</p>
                )}
                <div className={CALENDAR_DETAIL.answer}>
                  <Button
                    variant="secondary"
                    disabled={pending}
                    className="flex-1"
                    onClick={sayPresent}
                  >
                    {CALENDAR_COPY.respondPresent}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={pending}
                    className="flex-1"
                    onClick={() => answer(AttendanceStatuses.Absent)}
                  >
                    {CALENDAR_COPY.respondAbsent}
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {isAskingHours && (
        <AttendanceHoursDialog
          initial={initialHours(roster.myHours, entry)}
          isSaving={pending}
          onConfirm={(hours) => answer(AttendanceStatuses.Present, hours)}
          onClose={() => setAskingHours(false)}
        />
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
                      <div
                        key={status}
                        className={cn(
                          CALENDAR_STYLES.rollCallGroup,
                          roster.canManage && CALENDAR_STYLES.rollCallDrop,
                          roster.canManage && over === status && CALENDAR_STYLES.rollCallOver
                        )}
                        {...(roster.canManage ? containerProps(status) : {})}
                      >
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
                                key={person.id}
                                className={cn(
                                  CALENDAR_STYLES.rollCallPerson,
                                  CALENDAR_DETAIL.foldItem,
                                  roster.canManage && CALENDAR_STYLES.rollCallMovable,
                                  dragged?.id === person.id && CALENDAR_STYLES.rollCallDragged
                                )}
                                style={{ '--i': index + 1 } as CSSProperties}
                                {...(roster.canManage
                                  ? itemProps({ id: person.id, from: status })
                                  : {})}
                              >
                                <Avatar name={person.name} src={person.avatar} size="sm" />
                                {person.name}
                                {person.isReinforcement && <ReinforcementTag />}
                                {person.hours && (
                                  <span className={CALENDAR_STYLES.detailNote}>
                                    {CALENDAR_COPY.hoursRange
                                      .replace('{from}', formatClock(person.hours.from))
                                      .replace('{to}', formatClock(person.hours.to))}
                                  </span>
                                )}
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
