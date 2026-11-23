import 'server-only'

import { listReviewQueue } from '@/core/services/absences/AbsenceService'
import type { RecapContext, RecapDraft } from '@/types/recap'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Requests waiting on the member's decision, for the ones holding that right
 * @param {RecapContext} context - Member and rights
 * @return {Promise<RecapDraft[]>} - Beats
 */

export const readQueueBeats = async ({
  accountId,
  access,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  if (!access.can(Permissions.AbsenceReview)) return []

  const queue = await listReviewQueue(accountId, access.isAdmin)
  if (queue.length === 0) return []

  return [
    {
      beat: 'absencesWaiting',
      at: until,
      actorIds: queue.map((absence) => absence.accountId),
      count: queue.length,
      target: 'absence',
      targetId: null,
      subject: null,
    },
  ]
}
