import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { notify } from '@/core/services/system/NotificationService'
import { PLAY_GAMES } from '@/declarations/play'

/**
 * Notify game invitees
 * @param {string} sessionId - Game
 * @param {string} inviterId - Who calls
 * @param {string[]} recipients - Who answers
 * @return {Promise<void>} - Raised
 */

export const notifyPlayInvite = async (
  sessionId: string,
  inviterId: string,
  recipients: string[]
): Promise<void> => {
  if (recipients.length === 0) return

  // Never breaks the invitation
  try {
    const { game } = await prisma.playSession.findUniqueOrThrow({
      where: { id: sessionId },
      select: { game: true },
    })
    await notify({
      kind: 'PlayInvited',
      recipients,
      actorId: inviterId,
      target: 'playGame',
      targetId: sessionId,
      subject: PLAY_GAMES.label(game),
      once: true,
    })
  } catch (error) {
    logger.warn('[play] invitation not notified', error)
  }
}
