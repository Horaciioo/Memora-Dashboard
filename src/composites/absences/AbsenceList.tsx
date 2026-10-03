'use client'

import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ABSENCE_PAGE } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { MemberAbsence } from '@/types/members'
import { cn } from '@/utils/classnames'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { absenceReasonText, absenceSpan } from '@/utils/format/absences'
import { parseDay, startOfDay } from '@/utils/format/days'

export interface AbsenceListProps {
  absences: MemberAbsence[]
  onRemove: (absence: MemberAbsence) => void
}

/**
 * What was declared, newest first: dates, length, the reason as written, where it stands. A
 * request still waiting can be withdrawn from its row, any row from the right click
 * @param {MemberAbsence[]} absences - Own absences, newest first
 * @param {(absence: MemberAbsence) => void} onRemove - Asks to withdraw an absence
 * @return {JSX.Element}
 */

export const AbsenceList = ({ absences, onRemove }: AbsenceListProps) => {
  const { contextMenu } = useMenu()
  const today = startOfDay(new Date()).getTime()

  const Success = ICONS.success
  const Failure = ICONS.failure
  const Pending = ICONS.pending

  const removalMenu = (absence: MemberAbsence): MenuItem[] => [
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      onSelect: () => onRemove(absence),
    },
  ]

  return (
    <section className={ABSENCE_PAGE.list}>
      <h2 className={ABSENCE_PAGE.listTitle}>{ABSENCE_COPY.listTitle}</h2>

      {absences.map((absence) => {
        const { days, month } = absenceSpan(absence.startDate, absence.endDate)
        const reason = absenceReasonText(absence)
        const isPending = absence.status === AbsenceStatuses.Pending
        const isOver = startOfDay(parseDay(absence.endDate)).getTime() < today

        const status =
          absence.status === AbsenceStatuses.Refused
            ? { Icon: Failure, label: ABSENCE_COPY.statusRefused, tone: ABSENCE_PAGE.statusClosed }
            : absence.status === AbsenceStatuses.Cancelled
              ? {
                  Icon: Failure,
                  label: ABSENCE_COPY.statusCancelled,
                  tone: ABSENCE_PAGE.statusClosed,
                }
              : isPending
                ? {
                    Icon: Pending,
                    label: ABSENCE_COPY.statusPending,
                    tone: ABSENCE_PAGE.statusWaiting,
                  }
                : {
                    Icon: Success,
                    label: ABSENCE_COPY.statusApproved,
                    tone: ABSENCE_PAGE.statusDone,
                  }

        return (
          <div
            key={absence.id}
            className={ABSENCE_PAGE.row}
            onContextMenu={contextMenu(removalMenu(absence))}
          >
            <span className={ABSENCE_PAGE.rowDates}>{`${days} ${month}`}</span>
            <span className={ABSENCE_PAGE.rowDuration}>
              {absence.dayCount === 1
                ? ABSENCE_COPY.durationOne
                : ABSENCE_COPY.duration.replace('{days}', String(absence.dayCount))}
            </span>
            <span className={cn(ABSENCE_PAGE.rowReason, !reason && ABSENCE_PAGE.rowReasonEmpty)}>
              {reason ?? ABSENCE_COPY.noReason}
            </span>
            <span className={ABSENCE_PAGE.rowStatus}>
              {isPending && !isOver && (
                <button
                  type="button"
                  className={ABSENCE_PAGE.cancel}
                  onClick={() => onRemove(absence)}
                >
                  {ABSENCE_COPY.cancel}
                </button>
              )}
              <span className={cn('inline-flex items-center gap-1.5', status.tone)}>
                <status.Icon className={ABSENCE_PAGE.statusIcon} aria-hidden="true" />
                {status.label}
              </span>
            </span>
          </div>
        )
      })}
    </section>
  )
}
