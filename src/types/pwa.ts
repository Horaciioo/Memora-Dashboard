/**
 * Install offer of Chromium browsers, absent from the DOM typings
 * @typedef {Object} BeforeInstallPromptEvent
 * @property {() => Promise<void>} prompt - Opens the browser dialog
 * @property {Promise<{ outcome: 'accepted' | 'dismissed' }>} userChoice - Answer
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * What this browser allows for pushes
 * @type {'unsupported' | 'needsInstall' | 'denied' | 'available'}
 */

export type PushSupport = 'unsupported' | 'needsInstall' | 'denied' | 'available'

/**
 * How Memora installs on this device
 * @type {'installed' | 'prompt' | 'apple' | 'appleOther' | 'manual' | null}
 */

export type InstallRoute = 'installed' | 'prompt' | 'apple' | 'appleOther' | 'manual' | null
