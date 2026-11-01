import 'server-only'

import { logger } from '@/core/lib/logger'
import { batchesOf } from '@/core/lib/push'
import { deliverPushes } from '@/core/services/push/DeliveryService'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import { isPushConfigured } from '@/declarations/pwa/vapid'
import { runtime } from '@/managers/infrastructure/Core/runtime'

/**
 * Hand fresh notifications to the push queue, sent right away when no queue runs
 * @param {string[]} ids - Notification identifiers
 * @return {Promise<void>} - Queued
 */

export const queuePushes = async (ids: string[]): Promise<void> => {
  if (!isPushConfigured() || ids.length === 0) return

  const queues = runtime()?.queues

  for (const batch of batchesOf(ids, APPLICATION_SETTINGS.pushRecipientsPerJob)) {
    const jobId = queues?.isReady()
      ? await queues.enqueue('push', { ids: batch }).catch(() => null)
      : null

    // No queue, one attempt in this process
    if (!jobId) {
      void deliverPushes(batch).catch((error: unknown) =>
        logger.warn('[push] inline delivery left some pushes behind', error)
      )
    }
  }
}
