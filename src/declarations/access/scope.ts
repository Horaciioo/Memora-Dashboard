/**
 * How each scopable model reaches its creator
 * @type {Record<string, 'direct' | 'required' | 'relation' | 'shared'>}
 */

export const SCOPE_TARGETS = {
  // Several creators, or none
  project: 'shared',
  task: 'shared',
  meeting: 'shared',
  team: 'direct',
  calendarEvent: 'direct',
  liveconEntry: 'direct',
  live: 'required',
  // Never without a creator
  sanctionOffense: 'required',
  recruitmentSession: 'required',
  account: 'relation',
} as const

/**
 * Scopable model key
 * @type {keyof typeof SCOPE_TARGETS}
 */

export type ScopeTarget = keyof typeof SCOPE_TARGETS
