export const SanctionKinds = {
  Delete: 'DELETE',
  Warn: 'WARN',
  Timeout: 'TIMEOUT',
  Ban: 'BAN',
  None: 'NONE',
  Comment: 'COMMENT',
  Report: 'REPORT',
} as const

export type SanctionKindName = (typeof SanctionKinds)[keyof typeof SanctionKinds]

/**
 * Surfaces a panel moderates
 * @type {Record<string, string>}
 */

export const SanctionPanels = {
  Twitch: 'TWITCH',
  Youtube: 'YOUTUBE',
  Discord: 'DISCORD',
} as const

export type SanctionPanelName = (typeof SanctionPanels)[keyof typeof SanctionPanels]

/**
 * Weight of an offence inside one level
 * @type {Record<string, string>}
 */

export const SanctionGravities = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
} as const

export type SanctionGravityName = (typeof SanctionGravities)[keyof typeof SanctionGravities]
