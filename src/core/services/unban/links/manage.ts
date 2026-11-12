import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { assertExpiryChoice } from '@/core/lib/unban/linkInput'
import { recordEvent } from '@/core/services/system/ActivityService'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { expiryAfter, LINK_INCLUDE, loadLink, toLinkView } from './shared'
import type { UnbanLinkView } from '@/types/unban'
import type { UnbanCaller } from './shared'

/**
 * Push a link's expiry back, even once it was used
 * @param {string} id - Link identifier
 * @param {number} expiryDays - New validity from now
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanLinkView>} - Updated link
 */

export const extendLink = async (
  id: string,
  expiryDays: number,
  caller: UnbanCaller
): Promise<UnbanLinkView> => {
  assertExpiryChoice(expiryDays)

  const link = await loadLink(id, caller)
  if (link.revokedAt) throw conflict(UNBAN_ERRORS.linkRevoked)

  // The expiry is journaled again if it comes round once more
  const row = await prisma.unbanLink.update({
    where: { id },
    data: { expiresAt: expiryAfter(expiryDays), expiredLoggedAt: null },
    include: LINK_INCLUDE,
  })

  await recordEvent({
    eventType: 'UnbanLinkExtended',
    actorId: caller.actorId,
    targetType: 'unbanLink',
    targetId: id,
    summary: row.youtuber.name,
  })

  return toLinkView(row)
}

/**
 * Cut a link off, the linked request stays as it is
 * @param {string} id - Link identifier
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanLinkView>} - Revoked link
 */

export const revokeLink = async (id: string, caller: UnbanCaller): Promise<UnbanLinkView> => {
  const link = await loadLink(id, caller)

  // Only the call that really revokes is journaled
  const { count } = await prisma.unbanLink.updateMany({
    where: { id, revokedAt: null },
    data: { revokedAt: new Date(), revokedById: caller.actorId },
  })

  if (count > 0) {
    await recordEvent({
      eventType: 'UnbanLinkRevoked',
      actorId: caller.actorId,
      targetType: 'unbanLink',
      targetId: id,
      summary: link.youtuber.name,
    })
  }

  const row = await prisma.unbanLink.findUniqueOrThrow({ where: { id }, include: LINK_INCLUDE })

  return toLinkView(row)
}
