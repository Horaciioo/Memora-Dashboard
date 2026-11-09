import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { decodeKey } from '@/core/lib/pwa/platform'
import { readSubscriptionBody } from '@/core/lib/pwa/subscription'
import { PUSH_OPT_OUT_KEY } from '@/declarations/pwa/push'

// Blocked storage means no opt-out
const hasOptedOut = (): boolean => {
  try {
    return window.localStorage.getItem(PUSH_OPT_OUT_KEY) !== null
  } catch {
    return false
  }
}

/**
 * Remember the member choice
 * @param {boolean} isOff - Pushes refused here
 * @return {void}
 */

export const writePushOptOut = (isOff: boolean): void => {
  try {
    if (isOff) window.localStorage.setItem(PUSH_OPT_OUT_KEY, '1')
    else window.localStorage.removeItem(PUSH_OPT_OUT_KEY)
  } catch {
    return
  }
}

/**
 * Current or restored subscription
 * @param {string | null} publicKey - Server key
 * @return {Promise<string | null>} - Endpoint or nothing
 */

export const restoreSubscription = async (publicKey: string | null): Promise<string | null> => {
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing.endpoint
  if (!publicKey || Notification.permission !== 'granted' || hasOptedOut()) return null

  // Permission kept, subscription lost
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeKey(publicKey),
  })
  await apiPost(API_ROUTES.pushSubscription, readSubscriptionBody(subscription))

  return subscription.endpoint
}
