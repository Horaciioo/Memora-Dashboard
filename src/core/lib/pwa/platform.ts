import { APPLE_MOBILE, APPLE_OTHER_BROWSERS, STANDALONE_QUERY } from '@/declarations/pwa/platform'
import type { PushSupport } from '@/types/pwa'

/**
 * Whether Memora runs as an installed application
 * @return {boolean} - Standalone window
 */

export const isStandalone = (): boolean =>
  window.matchMedia(STANDALONE_QUERY).matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/**
 * Whether the device is an iPhone or an iPad
 * @return {boolean} - Apple handheld
 */

export const isAppleMobile = (): boolean =>
  APPLE_MOBILE.agent.test(navigator.userAgent) ||
  (navigator.platform === APPLE_MOBILE.desktopPlatform && navigator.maxTouchPoints > 1)

/**
 * Whether this Apple handheld browser is not Safari
 * @return {boolean} - Third-party browser
 */

export const isAppleOtherBrowser = (): boolean =>
  isAppleMobile() && APPLE_OTHER_BROWSERS.test(navigator.userAgent)

/**
 * What this browser allows for pushes, iOS opening them to installed applications only
 * @return {PushSupport} - Support level
 */

export const readPushSupport = (): PushSupport => {
  const hasApi = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (!hasApi) return isAppleMobile() && !isStandalone() ? 'needsInstall' : 'unsupported'
  if (Notification.permission === 'denied') return 'denied'

  return 'available'
}

/**
 * Decode a base64url key for the push manager
 * @param {string} value - Base64url key
 * @return {Uint8Array<ArrayBuffer>} - Raw bytes
 */

export const decodeKey = (value: string): Uint8Array<ArrayBuffer> => {
  const padded = `${value}${'='.repeat((4 - (value.length % 4)) % 4)}`
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))

  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}
