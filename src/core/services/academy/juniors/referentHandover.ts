import 'server-only'

import { prisma } from '@/core/lib/db'
import { notify } from '@/core/services/system/NotificationService'
import { juniorTargetId } from '@/declarations/notifications/targets'
import { startOfDay } from '@/utils/format/time/days'

/**
 * Hand a junior over
 * @param {Object} seat - Junior seat
 * @param {string} seat.id - Junior identifier
 * @param {string} seat.sessionId - Promotion
 * @param {string} seat.name - Junior name
 * @param {string | null} previousId - Former Référent
 * @param {string} nextId - New Référent
 * @return {Promise<void>} - Handed over
 */

export const handOverJunior = async (
  seat: { id: string; sessionId: string; name: string },
  previousId: string | null,
  nextId: string
): Promise<void> => {
  // Planned check-ins follow
  if (previousId) {
    await prisma.calendarEvent.updateMany({
      where: { juniorId: seat.id, ownerId: previousId, startsAt: { gte: startOfDay(new Date()) } },
      data: { ownerId: nextId },
    })
  }

  await notify({
    kind: 'PimReferentAssigned',
    recipients: [nextId],
    actorId: null,
    target: 'junior',
    targetId: juniorTargetId(seat.sessionId, seat.id),
    subject: seat.name,
  })
}
