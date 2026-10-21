'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { AttendanceHoursDialog } from '@/composites/calendar/AttendanceHoursDialog'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { CALENDAR_DETAIL, CALENDAR_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'
import { initialHours } from '@/utils/format/hours'
import type { CalendarEntry } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export interface AttendanceAnswerProps {
  entry: CalendarEntry
  pending: boolean
  onRespond: (status: AttendanceStatusName, hours?: { from: string; to: string }) => void
}

/**
 * Viewer's own roll-call answer, with the hours dialog
 * @param {CalendarEntry} entry - Roll-call entry on screen
 * @param {boolean} pending - A mutation is in flight
 * @param {(status: AttendanceStatusName, hours?: { from: string, to: string }) => void} onRespond - Send Present or Absent
 * @return {JSX.Element | null}
 */

export const AttendanceAnswer = ({ entry, pending, onRespond }: AttendanceAnswerProps) => {
  const [isChanging, setIsChanging] = useState(false)
  const [isAskingHours, setAskingHours] = useState(false)
  const roster = entry.attendance
  if (!roster) return null

  const isAnswered = roster.mine !== null && roster.mine !== AttendanceStatuses.Pending
  const isPresent = roster.mine === AttendanceStatuses.Present
  const AnswerIcon = ICONS[isPresent ? 'check' : 'cross']
  // Green once present, red once absent, grey before an answer
  const answerTone = isAnswered ? (isPresent ? 'success' : 'danger') : 'neutral'
  // A live names where to go once they come
  const hasLiveLink = isPresent && roster.asksHours && entry.href !== null
  const answerCopy = isPresent
    ? hasLiveLink
      ? CALENDAR_COPY.answeredLive
      : CALENDAR_COPY.answeredPresent
    : CALENDAR_COPY.answeredAbsent

  // Leaving the answer view closes the change view
  const answer = (status: AttendanceStatusName, hours?: { from: string; to: string }) => {
    setIsChanging(false)
    setAskingHours(false)
    onRespond(status, hours)
  }

  // Hours are asked before a Present goes out
  const sayPresent = () =>
    roster.asksHours ? setAskingHours(true) : answer(AttendanceStatuses.Present)

  return (
    <>
      {roster.mine !== null && (
        <section className={CALENDAR_DETAIL.section}>
          <h3 className={SECTION_STYLES.title}>{CALENDAR_COPY.yourPresence}</h3>
          <div
            className={cn(CALENDAR_DETAIL.tile, isAnswered && !isChanging && 'items-center')}
            style={accentVars(answerTone)}
          >
            {isAnswered && !isChanging ? (
              <>
                <p className={CALENDAR_DETAIL.answered}>
                  <AnswerIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
                  <span>
                    {answerCopy[0]}
                    <strong>{answerCopy[1]}</strong>
                    {answerCopy[2]}
                    {isPresent && roster.myHours && (
                      <>
                        {CALENDAR_COPY.hoursSpan[0]}
                        <strong>{formatClock(roster.myHours.from)}</strong>
                        {CALENDAR_COPY.hoursSpan[1]}
                        <strong>{formatClock(roster.myHours.to)}</strong>
                      </>
                    )}
                    {isPresent && (hasLiveLink ? '.' : CALENDAR_COPY.answeredPresentEnd)}
                  </span>
                </p>
                {hasLiveLink && entry.href && (
                  <p className={CALENDAR_DETAIL.answered}>
                    {CALENDAR_COPY.liveLink}
                    <AppLink
                      href={entry.href}
                      className="font-semibold underline underline-offset-2"
                    >
                      {CALENDAR_COPY.liveLinkLabel}
                    </AppLink>
                  </p>
                )}
                <button
                  type="button"
                  className={CALENDAR_DETAIL.changeMind}
                  onClick={() => setIsChanging(true)}
                >
                  {CALENDAR_COPY.changeMind}
                </button>
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
    </>
  )
}
