/*
 * Shared by the page and the service worker bundle: nothing here may import the app
 */

/**
 * Script path and scope of the service worker
 * @type {{ script: string, scope: string }}
 */

export const WORKER_FILE = { script: '/sw.js', scope: '/' } as const

/**
 * Query keys the page hands the worker through its script address
 * @type {Record<string, string>}
 */

export const WORKER_PARAMS = {
  version: 'version',
  offline: 'secours',
  // Off in development, chunks there are not content-hashed
  caching: 'cache',
} as const

/**
 * Messages between the page and the worker
 * @type {Record<string, string>}
 */

export const WORKER_MESSAGES = {
  skipWaiting: 'memora:skip-waiting',
  opened: 'memora:notification-opened',
} as const

/**
 * Cache names, the version is appended
 * @type {{ prefix: string, shell: string, assets: string }}
 */

export const WORKER_CACHES = {
  prefix: 'memora-',
  shell: 'memora-shell-',
  assets: 'memora-assets-',
} as const

/**
 * Immutable build output, safe to keep across visits
 * @type {string}
 */

export const WORKER_ASSET_PREFIX = '/_next/static/'

/**
 * Agents that tolerate a push without a visible notice
 * @type {RegExp}
 */

export const QUIET_PUSH_AGENTS = /\b(Chrome|Chromium|Edg)\//

/**
 * What the service worker draws for one push
 * @typedef {Object} PushPayload
 * @property {string} tag - Collapses duplicates
 * @property {string} title - First line
 * @property {string} body - Sentence
 * @property {string} url - Page it opens
 * @property {string | null} readUrl - Marks it read
 * @property {string | null} notificationId - Row it copies
 * @property {number} unread - App badge count
 * @property {string} icon - Large picture
 * @property {string} badge - Status bar glyph
 * @property {string} at - ISO timestamp
 */

export interface PushPayload {
  tag: string
  title: string
  body: string
  url: string
  readUrl: string | null
  notificationId: string | null
  unread: number
  icon: string
  badge: string
  at: string
}
