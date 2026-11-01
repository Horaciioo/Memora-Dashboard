import { readSecret } from '@/declarations/platforms/credentials'

/**
 * Keys signing every push
 * @typedef {Object} VapidKeys
 * @property {string | null} publicKey - Handed to browsers
 * @property {string | null} privateKey - Server only
 * @property {string | null} subject - Contact, mailto or https
 */

export interface VapidKeys {
  publicKey: string | null
  privateKey: string | null
  subject: string | null
}

/**
 * Push signing keys
 * @type {VapidKeys}
 */

export const VAPID_KEYS: VapidKeys = {
  publicKey: readSecret(process.env.PUSH_VAPID_PUBLIC_KEY),
  privateKey: readSecret(process.env.PUSH_VAPID_PRIVATE_KEY),
  subject: readSecret(process.env.PUSH_VAPID_SUBJECT),
}

/**
 * Whether pushes can leave the server
 * @return {boolean} - Configured
 */

export const isPushConfigured = (): boolean =>
  Boolean(VAPID_KEYS.publicKey && VAPID_KEYS.privateKey && VAPID_KEYS.subject)
