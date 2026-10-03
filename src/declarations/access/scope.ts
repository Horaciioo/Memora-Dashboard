/**
 * How each scopable model reaches its creator
 * @type {Record<string, 'direct' | 'required' | 'relation'>}
 */

export const SCOPE_TARGETS = {
  project: 'direct',
  task: 'direct',
  meeting: 'direct',
  team: 'direct',
  calendarEvent: 'direct',
  liveconEntry: 'direct',
  live: 'required',
  // Never without a creator, so no unassigned branch
  sanctionOffense: 'required',
  recruitmentSession: 'required',
  account: 'relation',
} as const

/**
 * Scopable model key
 * @type {keyof typeof SCOPE_TARGETS}
 */

export type ScopeTarget = keyof typeof SCOPE_TARGETS
