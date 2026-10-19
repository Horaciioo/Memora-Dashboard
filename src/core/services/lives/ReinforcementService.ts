import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { publishLive } from '@/core/lib/lives/bus'
import { isOpenLive } from '@/core/lib/lives/permissions'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import type { FieldOption } from '@/types/forms'
import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import type { LiveStatusName } from '@/utils/constants/lives'

/**
 * Load an open live inside the perimeter
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<object>} - Live row with who is convened
 */

const openLiveInScope = async (liveId: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id: liveId }),
    include: { members: { select: { accountId: true } } },
  })
  if (!live) throw notFound()
  if (!isOpenLive(live.status as LiveStatusName)) throw conflict()

  return live
}

/**
 * Everyone who could come as reinforcement, the team already on the live left out
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

export const readReinforcementChoices = async (
  liveId: string,
  scope: AccessScope
): Promise<FieldOption[]> => {
  const live = await openLiveInScope(liveId, scope)

  const rows = await prisma.account.findMany({
    where: {
      status: { notIn: GONE_MEMBER_STATUSES },
      id: { notIn: live.members.map((member) => member.accountId) },
    },
    select: { id: true, displayName: true, avatarUrl: true, role: true },
  })

  return roleGroupedOptions(rows)
}

/**
 * Call members to a running or announced live as reinforcement
 * @param {Object} input - Reinforcement
 * @param {string} input.liveId - Live
 * @param {string[]} input.accountIds - Members called
 * @param {string} input.actorId - Responsable asking
 * @param {AccessScope} input.scope - Viewer perimeter
 * @return {Promise<void>} - Called
 */

export const addReinforcements = async ({
  liveId,
  accountIds,
  actorId,
  scope,
}: {
  liveId: string
  accountIds: string[]
  actorId: string
  scope: AccessScope
}): Promise<void> => {
  const live = await openLiveInScope(liveId, scope)
  const known = new Set(live.members.map((member) => member.accountId))
  const added = accountIds.filter((id) => !known.has(id))
  if (added.length === 0) return

  // Active members only
  const accounts = await prisma.account.findMany({
    where: { id: { in: added }, status: { notIn: GONE_MEMBER_STATUSES } },
    select: { id: true },
  })

  await prisma.liveMember.createMany({
    data: accounts.map((account) => ({
      liveId,
      accountId: account.id,
      reinforcement: true,
      requestedById: actorId,
    })),
    skipDuplicates: true,
  })

  // They join the roll-call, so the Responsables see them answer
  if (live.calendarEventId) {
    await syncRoster(
      live.calendarEventId,
      accounts.map((account) => account.id)
    )
  }

  await publishLive(LIVE_TOPICS.lives, {
    liveId,
    youtuberId: live.youtuberId,
    status: live.status as LiveStatusName,
  })
}
