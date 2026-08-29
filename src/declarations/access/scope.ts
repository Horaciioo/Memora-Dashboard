/**
 * How each scopable model reaches its creator
 * @type {Record<string, 'direct' | 'relation'>}
 */

export const SCOPE_TARGETS = {
  project: 'direct',
  task: 'direct',
  meeting: 'direct',
  team: 'direct',
  calendarEvent: 'direct',
  liveconEntry: 'direct',
  sanctionOffense: 'direct',
  recruitmentSession: 'direct',
  account: 'relation',
} as const

/**
 * Scopable model key
 * @type {keyof typeof SCOPE_TARGETS}
 */

export type ScopeTarget = keyof typeof SCOPE_TARGETS
