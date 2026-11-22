import 'server-only'
import { prisma } from '@/core/lib/db'
import { releasedFrom } from '@/core/services/academy/legacy/LegacyRelease'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { peopleInScope } from '@/core/services/work/shared'
import { LIVE_FUNCTIONS } from '@/declarations/lives/registries'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

/**
 * Members on approved leave over a window
 * @param {string[]} accountIds - Candidates
 * @param {Date} startsAt - Window start
 * @param {Date} endsAt - Window end
 * @return {Promise<Set<string>>} - Absent accounts
 */

const absentOver = async (accountIds: string[], startsAt: Date, endsAt: Date) => {
  if (accountIds.length === 0) return new Set<string>()

  const rows = await prisma.absence.findMany({
    where: {
      accountId: { in: accountIds },
      ...activeAbsenceFilter(startsAt, endsAt),
    },
    select: { accountId: true },
  })

  return new Set(rows.map((row) => row.accountId))
}

/**
 * Members a live convenes, and the ones kept off it by their leave
 * @param {Object} input - Roster context
 * @param {string} input.youtuberId - Creator
 * @param {string[]} input.picked - Members named on top of the live team
 * @param {Date} input.startsAt - Planned start
 * @param {Date} input.endsAt - Planned end
 * @param {AccessScope} input.scope - Creator perimeter
 * @return {Promise<{ convened: string[], onLeave: string[] }>} - Convened accounts and members on leave
 */

export const conveneWithLeave = async ({
  youtuberId,
  picked,
  startsAt,
  endsAt,
  scope,
}: {
  youtuberId: string
  picked: string[]
  startsAt: Date
  endsAt: Date
  scope: AccessScope
}): Promise<{ convened: string[]; onLeave: string[] }> => {
  // The creator's live team is always convened, the members named come on top
  const where: Prisma.AccountWhereInput = {
    OR: [
      {
        youtubers: { some: { id: youtuberId } },
        functions: { some: { jobFunction: { name: { in: [...LIVE_FUNCTIONS] } } } },
      },
      ...(picked.length > 0 ? [{ id: { in: picked } }] : []),
    ],
  }

  const accounts = await prisma.account.findMany({
    where: { AND: [where, { status: { notIn: GONE_MEMBER_STATUSES } }, peopleInScope(scope)] },
    select: { id: true, functions: { select: { jobFunction: { select: { name: true } } } } },
  })
  const ids = accounts.map((account) => account.id)

  // Absent or released members are never called
  const [absent, released] = await Promise.all([
    absentOver(ids, startsAt, endsAt),
    releasedFrom(ids, startsAt),
  ])

  return {
    convened: ids.filter((id) => !absent.has(id) && !released.has(id)),
    // Only the live crew shows as absent
    onLeave: accounts
      .filter((account) =>
        account.functions.some((held) => LIVE_FUNCTIONS.includes(held.jobFunction.name))
      )
      .map((account) => account.id)
      .filter((id) => absent.has(id) && !released.has(id)),
  }
}

/**
 * Members a live convenes
 * @param {Parameters<typeof conveneWithLeave>[0]} input - Roster context
 * @return {Promise<string[]>} - Convened accounts
 */

export const convene = async (input: Parameters<typeof conveneWithLeave>[0]): Promise<string[]> =>
  (await conveneWithLeave(input)).convened
