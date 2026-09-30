import type { IconName } from '@/declarations/ui/icons'

/**
 * User agent tokens read as a browser, first match wins
 * @type {ReadonlyArray<readonly [string, string]>}
 */

export const BROWSER_TOKENS = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari'],
] as const

/**
 * User agent tokens read as a system, first match wins
 * @type {ReadonlyArray<readonly [string, string]>}
 */

export const SYSTEM_TOKENS = [
  ['iPhone', 'iOS'],
  ['iPad', 'iPadOS'],
  ['Android', 'Android'],
  ['Mac OS X', 'macOS'],
  ['Windows', 'Windows'],
  ['Linux', 'Linux'],
] as const

// Tokens of a handheld client
export const MOBILE_TOKENS = ['Mobile', 'iPhone', 'Android'] as const

/**
 * Glyph per device kind
 * @type {Record<string, IconName>}
 */

export const DEVICE_ICONS = {
  mobile: 'phone',
  desktop: 'system',
} as const satisfies Record<string, IconName>
