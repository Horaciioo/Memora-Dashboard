import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { loadTarget } from '@/core/services/members/admin/guards'
import type { AdminActor } from '@/core/services/members/admin/guards'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import type { MemberSuspension } from '@/types/members'
import { addDays, startOfDay } from '@/utils/format/days'

/**
 * Suspension in force on a member
 * @param {string} accountId - Account identifier
 * @return {Promise<MemberSuspension | null>} - Pause still running
 */

export const activeSuspension = async (accountId: string): Promise<MemberSuspension | null> => {
  const row = await prisma.liveSuspension.findFirst({
    where: { accountId, liftedAt: null, endsAt: { gt: new Date() } },
    orderBy: { endsAt: 'desc' },
  })

  return row ? { id: row.id, endsAt: row.endsAt.toISOString(), reason: row.reason } : null
}

/**
 * Last moment of a chosen day
 * @param {string} day - ISO day
 * @return {Date} - End of that day
 */

const endOfChosenDay = (day: string): Date => {
  const parsed = new Date(`${day}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw invalidInput([{ field: 'until', message: MEMBER_ADMIN_COPY.untilRequired }])
  }

  return new Date(addDays(startOfDay(parsed), 1).getTime() - 1)
}

/**
 * Pause a member's live moderation until a day
 * @param {string} id - Account identifier
 * @param {Object} input - Pause
 * @param {string} input.until - Last day, ISO
 * @param {string | null} input.reason - Why
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<MemberSuspension>} - Pause laid
 */

export const suspendLives = async (
  id: string,
  input: { until: string; reason: string | null },
  actor: AdminActor
): Promise<MemberSuspension> => {
  await loadTarget(id, actor)

  const endsAt = endOfChosenDay(input.until)
  const horizon = addDays(startOfDay(new Date()), LIVE_SETTINGS.suspensionMaxDays)

  if (endsAt <= new Date() || endsAt > horizon) {
    throw invalidInput([{ field: 'until', message: MEMBER_ADMIN_COPY.untilRequired }])
  }
  if (await activeSuspension(id)) throw conflict()

  const row = await prisma.liveSuspension.create({
    data: { accountId: id, endsAt, reason: input.reason, createdById: actor.id },
  })

  return { id: row.id, endsAt: row.endsAt.toISOString(), reason: row.reason }
}

/**
 * Lift the pause in force
 * @param {string} id - Account identifier
 * @param {AdminActor} actor - Who is acting
 * @return {Promise<void>} - Lifted
 */

export const liftSuspension = async (id: string, actor: AdminActor): Promise<void> => {
  await loadTarget(id, actor)

  const { count } = await prisma.liveSuspension.updateMany({
    where: { accountId: id, liftedAt: null, endsAt: { gt: new Date() } },
    data: { liftedAt: new Date() },
  })
  if (count === 0) throw conflict()
}
