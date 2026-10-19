import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { publishLive } from '@/core/lib/lives/bus'
import { isOpenLive } from '@/core/lib/lives/permissions'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { assertCoordinators, coordinatorOptions } from '@/core/services/lives/LiveService'
import { notify } from '@/core/services/system/NotificationService'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import type { FieldOption } from '@/types/forms'
import type { LiveStatusName } from '@/utils/constants/lives'

/**
 * Load an open live inside the perimeter
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<object>} - Live row with its seats
 */

const openLiveInScope = async (liveId: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id: liveId }),
    include: { coordinations: { select: { accountId: true } } },
  })
  if (!live) throw notFound()
  if (!isOpenLive(live.status as LiveStatusName)) throw conflict()

  return live
}

/**
 * Members a live may be coordinated by, and who is asked now
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<{ options: FieldOption[], selected: string[] }>} - Choices
 */

export const readCoordinatorChoices = async (
  liveId: string,
  scope: AccessScope
): Promise<{ options: FieldOption[]; selected: string[] }> => {
  const live = await openLiveInScope(liveId, scope)
  const options = await coordinatorOptions(scope)

  return {
    // An Admin is offered on every creator
    options: options.filter((option) => !option.owners || option.owners.includes(live.youtuberId)),
    selected: live.coordinations.map((seat) => seat.accountId),
  }
}

/**
 * Replace the Coordinators of an announced or running live
 * @param {Object} input - Change
 * @param {string} input.liveId - Live
 * @param {string[]} input.accountIds - Members that coordinate from now on
 * @param {string} input.actorId - Who edits
 * @param {AccessScope} input.scope - Viewer perimeter
 * @return {Promise<void>} - Seats updated
 */

export const setLiveCoordinators = async ({
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
  const known = new Set(live.coordinations.map((seat) => seat.accountId))
  const added = accountIds.filter((id) => !known.has(id))
  await assertCoordinators(live.youtuberId, added)

  // Dropped seats go, the answers of the others stay
  await prisma.liveCoordination.deleteMany({ where: { liveId, accountId: { notIn: accountIds } } })
  await prisma.liveCoordination.createMany({
    data: added.map((accountId) => ({ liveId, accountId })),
    skipDuplicates: true,
  })

  // A new Coordinator joins the roll-call and is asked
  await prisma.liveMember.createMany({
    data: added.map((accountId) => ({ liveId, accountId })),
    skipDuplicates: true,
  })
  if (live.calendarEventId) await syncRoster(live.calendarEventId, added)

  await notify({
    kind: 'LiveCoordinatorAsked',
    recipients: added,
    actorId,
    target: 'home',
    subject: live.title,
  })

  await publishLive(LIVE_TOPICS.lives, {
    liveId,
    youtuberId: live.youtuberId,
    status: live.status as LiveStatusName,
  })
}
