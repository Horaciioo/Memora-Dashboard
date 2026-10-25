import type { PeriodRun } from '@/core/lib/calendar/periodRuns'

/**
 * Run seated on a lane
 * @typedef {Object} LanedRun
 * @property {PeriodRun} run - Stretch of a period
 * @property {number} lane - Line it sits on, from zero
 */

export interface LanedRun {
  run: PeriodRun
  lane: number
}

/**
 * Seat the runs of one row on lines so none covers another
 * @param {PeriodRun[]} runs - Runs of one row
 * @return {{ placed: LanedRun[], lanes: number }} - Runs with their line and the lines used
 */

export const seatRuns = (runs: PeriodRun[]): { placed: LanedRun[]; lanes: number } => {
  // Last column each line holds
  const ends: number[] = []

  const placed = [...runs]
    .sort((left, right) => left.from - right.from || right.to - left.to)
    .map((run) => {
      const free = ends.findIndex((end) => end < run.from)
      const lane = free === -1 ? ends.length : free
      ends[lane] = run.to

      return { run, lane }
    })

  return { placed, lanes: ends.length }
}
