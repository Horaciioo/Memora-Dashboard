import type { PushSubscriptionInput } from '@/types/push'

/**
 * Body the server expects from a browser subscription
 * @param {PushSubscription} subscription - Browser subscription
 * @return {PushSubscriptionInput} - Endpoint and keys
 */

export const readSubscriptionBody = (subscription: PushSubscription): PushSubscriptionInput => {
  const { endpoint, keys } = subscription.toJSON()

  return {
    endpoint: endpoint ?? subscription.endpoint,
    p256dh: keys?.p256dh ?? '',
    auth: keys?.auth ?? '',
  }
}
