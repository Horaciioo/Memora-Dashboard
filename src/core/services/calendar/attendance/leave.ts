import 'server-only'
import { prisma } from '@/core/lib/db'
import { absenceDay, activeAbsenceFilter } from '@/core/services/absences/AbsenceService/shape'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { LIVE_FUNCTIONS } from '@/declarations/lives/registries'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Far enough to hold every leave, short of the largest date, which the zone shift would overflow
const END_OF_TIME = new Date('9999-12-31T00:00:00.000Z')

/**
 * Settle the unanswered rows of Live moderators on approved leave as absent
 * @param {Prisma.EventAttendanceWhereInput} where - Rows looked at
 * @return {Promise<void>} - Settled
 */

const settleOnLeave = async (where: Prisma.EventAttendanceWhereInput): Promise<void> => {
  const rows = await prisma.eventAttendance.findMany({
    where: {
      ...where,
      status: AttendanceStatuses.Pending,
      event: { rollCall: true },
      // Only the Live moderators are spared the answer
      account: { functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } } },
    },
    select: {
      id: true,
      accountId: true,
      event: { select: { startsAt: true, endsAt: true } },
    },
  })
  if (rows.length === 0) return

  const leaves = await prisma.absence.findMany({
    where: {
      accountId: { in: [...new Set(rows.map((row) => row.accountId))] },
      ...activeAbsenceFilter(new Date(0), END_OF_TIME),
    },
    select: { accountId: true, startDate: true, endDate: true },
  })

  const settled = rows.filter((row) => {
    const first = absenceDay(row.event.startsAt)
    const last = absenceDay(row.event.endsAt ?? row.event.startsAt)

    return leaves.some(
      (leave) =>
        leave.accountId === row.accountId && leave.startDate <= last && leave.endDate >= first
    )
  })
  if (settled.length === 0) return

  await prisma.eventAttendance.updateMany({
    where: { id: { in: settled.map((row) => row.id) } },
    data: { status: AttendanceStatuses.Absent, respondedAt: new Date() },
  })
  await syncJuniorLives([...new Set(settled.map((row) => row.accountId))])
}

/**
 * Settle one roll-call's Live moderators on leave
 * @param {string} eventId - Roll-call event
 * @return {Promise<void>} - Settled
 */

export const settleEventLeave = (eventId: string): Promise<void> => settleOnLeave({ eventId })

/**
 * Settle a member's coming roll-calls once their leave is approved
 * @param {string} accountId - Member on leave
 * @return {Promise<void>} - Settled
 */

export const settleMemberLeave = (accountId: string): Promise<void> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return settleOnLeave({ accountId, event: { startsAt: { gte: today } } })
}
