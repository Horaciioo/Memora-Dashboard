import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { varied } from '@/core/lib/assistant/variants'
import { POINT_VARIANTS } from '@/declarations/assistant/variants/points'
import type { MemberAbsence } from '@/types/members'
import type { RecapThread } from '@/types/recap'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { absenceRange } from '@/utils/format/absences'

/**
 * Whether a thread is the absences waiting for the member's word
 * @param {RecapThread} thread - Thread
 * @return {boolean} - It is
 */

export const isWaiting = (thread: RecapThread): boolean =>
  thread.beats[0].beat === 'absencesWaiting'

/**
 * Absences of others still waiting for a word
 * @param {string} accountId - Member answering
 * @return {Promise<MemberAbsence[]>} - Absences to settle
 */

export const pendingOf = async (accountId: string): Promise<MemberAbsence[]> =>
  (await apiGet<MemberAbsence[]>(API_ROUTES.absences)).filter(
    (absence) => absence.status === AbsenceStatuses.Pending && absence.accountId !== accountId
  )

// First names spoken as a list: "Max, Léa et Tom"
const namesOf = (list: MemberAbsence[]): string => {
  const names = list.map((absence) => absence.memberName.split(' ')[0])

  return names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names.at(-1)}` : names[0]
}

/**
 * What Memora says of the absences waiting, in her own words each time
 * @param {MemberAbsence[]} pending - Absences waiting
 * @return {string[]} - Lines
 */

export const waitingLines = (pending: MemberAbsence[]): string[] => {
  if (pending.length > 1) {
    return [
      varied('absence.many', POINT_VARIANTS.absenceMany, {
        count: String(pending.length),
        names: namesOf(pending),
      }),
    ]
  }

  const [absence] = pending
  const lines = [
    varied('absence.one', POINT_VARIANTS.absenceOne, {
      name: absence.memberName.split(' ')[0],
      range: absenceRange(absence.startDate, absence.endDate),
    }),
  ]
  if (absence.reason) {
    lines.push(varied('absence.reason', POINT_VARIANTS.absenceReason, { reason: absence.reason }))
  }

  return lines
}
