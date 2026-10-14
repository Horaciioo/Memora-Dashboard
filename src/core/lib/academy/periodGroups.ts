import type { MilestoneState } from '@/core/lib/academy/parkourTimeline'
import type { PimPeriodName } from '@/declarations/academy/timeline'

/**
 * Moments of one period, with where the period stands
 * @typedef {Object} PeriodGroup
 * @property {PimPeriodName} period - Which period
 * @property {T[]} items - Its moments in running order
 * @property {MilestoneState} state - Done, in course or ahead
 * @property {number} done - Moments done
 */

export interface PeriodGroup<T> {
  period: PimPeriodName
  items: T[]
  state: MilestoneState
  done: number
}

/**
 * State a period takes from its moments
 * @param {MilestoneState[]} states - State of each moment
 * @return {MilestoneState} - Period state
 */

const stateOf = (states: MilestoneState[]): MilestoneState => {
  if (states.every((state) => state === 'done')) return 'done'
  if (states.every((state) => state === 'upcoming')) return 'upcoming'

  return states.includes('late') ? 'late' : 'current'
}

/**
 * Gather moments under their period, in the order met
 * @param {T[]} items - Moments in running order
 * @return {PeriodGroup<T>[]} - One group per period
 */

export const groupByPeriod = <T extends { period: PimPeriodName; state: MilestoneState }>(
  items: T[]
): PeriodGroup<T>[] => {
  const groups = Map.groupBy(items, (item) => item.period)

  return [...groups].map(([period, members]) => {
    const states = members.map((member) => member.state)

    return {
      period,
      items: members,
      state: stateOf(states),
      done: states.filter((state) => state === 'done').length,
    }
  })
}
