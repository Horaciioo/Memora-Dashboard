import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { absenceDay } from '@/core/services/absences/AbsenceService'
import { notify } from '@/core/services/system/NotificationService'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { juniorTargetId } from '@/declarations/notifications/targets'
import type { JuniorAbsenceView } from '@/types/academy'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'

/**
 * Absences of one junior, without the reason they wrote
 * @param {string} juniorId - Junior seat
 * @param {AcademyScope} scope - What the viewer may reach
 * @return {Promise<JuniorAbsenceView[]>} - Absences still standing, newest first
 */

export const listJuniorAbsences = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorAbsenceView[]> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope.session, ...scope.juniors },
    select: { accountId: true, startedAt: true },
  })
  if (!junior) throw notFound()

  const rows = await prisma.absence.findMany({
    where: {
      accountId: junior.accountId,
      endDate: { gte: absenceDay(junior.startedAt) },
      status: { in: [AbsenceStatuses.Pending, AbsenceStatuses.Approved] },
    },
    select: { id: true, startDate: true, endDate: true, dayCount: true, status: true },
    orderBy: { startDate: 'desc' },
    take: ACADEMY_SETTINGS.juniorAbsencesLimit,
  })

  return rows.map((row) => ({
    id: row.id,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    dayCount: row.dayCount,
    status: row.status,
  }))
}

/**
 * Tell the referents of a member that they declared an absence
 * @param {string} accountId - Member who will be away
 * @param {string} memberName - Their name
 * @param {string | null} actorId - Who posted it, if not them
 * @return {Promise<void>} - Raised
 */

export const notifyJuniorAbsence = async (
  accountId: string,
  memberName: string,
  actorId: string | null
): Promise<void> => {
  const seats = await prisma.academyJunior.findMany({
    where: { accountId, status: AcademyJuniorStatuses.Active, referentId: { not: null } },
    select: { id: true, sessionId: true, referentId: true },
  })

  await Promise.all(
    seats.map((seat) =>
      notify({
        kind: 'JuniorAbsent',
        recipients: [seat.referentId],
        actorId: actorId ?? accountId,
        target: 'junior',
        targetId: juniorTargetId(seat.sessionId, seat.id),
        subject: memberName,
      })
    )
  )
}
