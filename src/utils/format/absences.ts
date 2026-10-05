import { DATE_LOCALE } from '@/declarations/ui/dates'
import type { MemberAbsence } from '@/types/members'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { parseDay, startOfDay } from '@/utils/format/days'

/**
 * What the member wrote for their team
 * @param {MemberAbsence} absence - Absence row
 * @return {string | null} - Reason
 */

export const absenceReasonText = (absence: MemberAbsence): string | null =>
  absence.reason?.trim() || null

/**
 * Days and month of an absence
 * @param {string} start - First day
 * @param {string} end - Last day
 * @return {{ days: string, month: string }} - Large and small parts of the range
 */

export const absenceSpan = (start: string, end: string): { days: string; month: string } => {
  const from = parseDay(start)
  const to = parseDay(end)
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  const label = (date: Date, month: 'long' | 'short') =>
    date.toLocaleDateString(DATE_LOCALE, { month })

  if (from.getTime() === to.getTime()) {
    return { days: String(from.getDate()), month: `${label(from, 'long')} ${from.getFullYear()}` }
  }

  if (sameMonth) {
    return {
      days: `${from.getDate()} → ${to.getDate()}`,
      month: `${label(from, 'long')} ${from.getFullYear()}`,
    }
  }

  return {
    days: `${from.getDate()} ${label(from, 'short')} → ${to.getDate()} ${label(to, 'short')}`,
    month: String(to.getFullYear()),
  }
}

/**
 * A range read as a sentence: "lundi 26 au vendredi 30 octobre"
 * @param {string} start - First day
 * @param {string} end - Last day
 * @return {string} - Sentence
 */

export const absenceSentence = (start: string, end: string): string => {
  const from = parseDay(start)
  const to = parseDay(end)
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  const part = (date: Date, withMonth: boolean) =>
    date.toLocaleDateString(DATE_LOCALE, {
      weekday: 'long',
      day: 'numeric',
      ...(withMonth ? { month: 'long' } : {}),
    })

  if (from.getTime() === to.getTime()) return part(from, true)

  return `${part(from, !sameMonth)} au ${part(to, true)}`
}

/**
 * Whether an absence is closed: refused, withdrawn, or its last day already behind
 * @param {MemberAbsence} absence - Absence to read
 * @param {number} today - Start of today
 * @return {boolean}
 */

export const isFinishedAbsence = (absence: MemberAbsence, today: number): boolean =>
  absence.status === AbsenceStatuses.Refused ||
  absence.status === AbsenceStatuses.Cancelled ||
  startOfDay(parseDay(absence.endDate)).getTime() < today
