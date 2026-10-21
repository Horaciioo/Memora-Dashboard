import type { CalendarEntry } from '@/types/calendar'

/**
 * Stretch of a period inside one row of the grid
 * @typedef {Object} PeriodRun
 * @property {CalendarEntry} entry - Period
 * @property {number} row - Index of the row
 * @property {number} from - First column, from zero
 * @property {number} to - Last column
 * @property {boolean} opens - The period starts on the first day of the run
 * @property {boolean} closes - The period ends on the last day of the run
 * @property {boolean} labelled - The run carries the title of the period
 */

export interface PeriodRun {
  entry: CalendarEntry
  row: number
  from: number
  to: number
  opens: boolean
  closes: boolean
  labelled: boolean
}

/**
 * Cut every period into the runs it makes in each row of the grid, the first run of a period carries its title
 * @param {string[][]} rows - Day keys of each row
 * @param {(dayKey: string) => CalendarEntry[]} periodsOn - Periods running under a day
 * @param {(entry: CalendarEntry) => string} firstDay - First ISO day of a period
 * @param {(entry: CalendarEntry) => string} lastDay - Last ISO day of a period
 * @return {PeriodRun[]} - Runs, in reading order
 */

export const periodRuns = (
  rows: string[][],
  periodsOn: (dayKey: string) => CalendarEntry[],
  firstDay: (entry: CalendarEntry) => string,
  lastDay: (entry: CalendarEntry) => string
): PeriodRun[] => {
  const runs: PeriodRun[] = []
  const seen = new Set<string>()

  rows.forEach((row, rowIndex) => {
    const open = new Map<string, PeriodRun>()

    row.forEach((dayKey, column) => {
      const here = periodsOn(dayKey)

      for (const entry of here) {
        const run = open.get(entry.id)
        if (run) {
          run.to = column
          run.closes = lastDay(entry) === dayKey
          continue
        }

        const created: PeriodRun = {
          entry,
          row: rowIndex,
          from: column,
          to: column,
          opens: firstDay(entry) === dayKey,
          closes: lastDay(entry) === dayKey,
          labelled: !seen.has(entry.id),
        }
        seen.add(entry.id)
        open.set(entry.id, created)
        runs.push(created)
      }
    })
  })

  return runs
}
