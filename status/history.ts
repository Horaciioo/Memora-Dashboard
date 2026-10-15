import { SETTINGS } from './declarations.ts'
import type { Health } from './declarations.ts'

/**
 * Checks counted for a day
 * @typedef {Record<Health, number>} DayTally
 */

export type DayTally = Record<Health, number>

/**
 * Component history
 * @typedef {Object} ComponentState
 * @property {Health | null} health - Last result
 * @property {number | null} ms - Last answer time
 * @property {number} bad - Failing checks in a row
 * @property {number} good - Healthy checks in a row
 * @property {Record<string, DayTally>} days - Tally per day
 */

export interface ComponentState {
  health: Health | null
  ms: number | null
  bad: number
  good: number
  days: Record<string, DayTally>
}

/**
 * Recorded incident
 * @typedef {Object} Incident
 * @property {string} id - Identifier
 * @property {string} component - Component key
 * @property {Health} worst - Worst level reached
 * @property {string} startedAt - ISO start
 * @property {string | null} resolvedAt - ISO end
 */

export interface Incident {
  id: string
  component: string
  worst: Health
  startedAt: string
  resolvedAt: string | null
}

/**
 * Persisted state
 * @typedef {Object} StatusState
 * @property {Record<string, ComponentState>} components - Per component
 * @property {Incident[]} incidents - Newest first
 * @property {string | null} checkedAt - ISO last round
 */

export interface StatusState {
  components: Record<string, ComponentState>
  incidents: Incident[]
  checkedAt: string | null
}

// Day key in the display zone
const dayKey = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: SETTINGS.timeZone }).format(date)

/**
 * Empty state
 * @return {StatusState} - Fresh state
 */

export const emptyState = (): StatusState => ({ components: {}, incidents: [], checkedAt: null })

/**
 * Keep a check in the history
 * @param {StatusState} state - State mutated in place
 * @param {string} id - Component key
 * @param {Health} health - Check result
 * @param {number} ms - Answer time
 * @param {Date} at - Check moment
 * @return {void}
 */

export const recordCheck = (
  state: StatusState,
  id: string,
  health: Health,
  ms: number,
  at: Date
): void => {
  const component = (state.components[id] ??= { health: null, ms: null, bad: 0, good: 0, days: {} })
  const key = dayKey(at)

  // Day tally
  const tally = (component.days[key] ??= { up: 0, degraded: 0, down: 0 })
  tally[health]++

  // Streaks
  component.health = health
  component.ms = ms
  component.bad = health === 'up' ? 0 : component.bad + 1
  component.good = health === 'up' ? component.good + 1 : 0

  // Incident lifecycle
  const open = state.incidents.find((item) => item.component === id && !item.resolvedAt)

  if (open && health === 'down') open.worst = 'down'

  if (!open && component.bad === SETTINGS.confirmations) {
    state.incidents.unshift({
      id: `${id}-${at.getTime()}`,
      component: id,
      worst: health,
      startedAt: at.toISOString(),
      resolvedAt: null,
    })
  }

  if (open && component.good === SETTINGS.confirmations) open.resolvedAt = at.toISOString()

  // Old days leave
  const oldest = Object.keys(component.days).sort().slice(0, -SETTINGS.historyDays)
  for (const old of oldest) delete component.days[old]
}

/**
 * Worst level of a day
 * @param {DayTally | undefined} tally - Day counts
 * @return {Health | null} - Day level
 */

export const dayHealth = (tally: DayTally | undefined): Health | null => {
  if (!tally) return null
  if (tally.down >= SETTINGS.redDayChecks) return 'down'

  return tally.down + tally.degraded > 0 ? 'degraded' : 'up'
}

/**
 * Availability over the history
 * @param {ComponentState} component - Component history
 * @return {number | null} - Percent
 */

export const uptimePercent = (component: ComponentState): number | null => {
  const tallies = Object.values(component.days)
  const total = tallies.reduce((sum, tally) => sum + tally.up + tally.degraded + tally.down, 0)
  if (total === 0) return null

  const down = tallies.reduce((sum, tally) => sum + tally.down, 0)

  return ((total - down) / total) * 100
}
