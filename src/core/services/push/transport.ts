import 'server-only'

import { sendNotification, WebPushError } from 'web-push'

import { logger } from '@/core/lib/logger'
import { pushOutcomeOf } from '@/core/lib/push/outcome'
import { pushTopicOf } from '@/core/lib/push/topic'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import { VAPID_KEYS } from '@/declarations/pwa/vapid'
import type { PushPayload } from '@/declarations/pwa/worker'

/**
 * Where one push goes
 * @typedef {Object} PushTarget
 * @property {string} endpoint - Push service address
 * @property {string} p256dh - Browser public key
 * @property {string} auth - Shared secret
 */

export interface PushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Hand one encrypted push to its push service
 * @param {PushTarget} target - Subscription
 * @param {PushPayload} payload - What the worker draws
 * @param {boolean} isUrgent - Wakes a sleeping phone
 * @return {Promise<number | null>} - Status code, null when the request never landed
 */

export const sendPush = async (
  target: PushTarget,
  payload: PushPayload,
  isUrgent: boolean
): Promise<number | null> => {
  const { publicKey, privateKey, subject } = VAPID_KEYS
  if (!publicKey || !privateKey || !subject) return null

  try {
    const response = await sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(payload),
      {
        vapidDetails: { subject, publicKey, privateKey },
        TTL: APPLICATION_SETTINGS.pushTtlSeconds,
        urgency: isUrgent ? 'high' : 'normal',
        // A retried push replaces its first copy
        topic: pushTopicOf(payload.tag),
      }
    )

    return response.statusCode
  } catch (error) {
    if (!(error instanceof WebPushError)) return null

    // Refusal reason for the logs
    if (pushOutcomeOf(error.statusCode) === 'failed') {
      logger.warn('[push] refused', { statusCode: error.statusCode, reason: error.body })
    }

    return error.statusCode
  }
}
