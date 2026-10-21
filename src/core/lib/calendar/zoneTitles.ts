import type { CalendarEntry } from '@/types/calendar'

/**
 * Where a zone title is drawn
 * @typedef {Object} ZoneTitleSpot
 * @property {CalendarEntry} zone - Zone it names
 * @property {number} row - Index of the row it sits in
 * @property {number} from - First column, from zero
 * @property {number} to - Last column
 */

export interface ZoneTitleSpot {
  zone: CalendarEntry
  row: number
  from: number
  to: number
}

/**
 * Pick, for every zone, the widest run of days it fills in one row, so its title is drawn once
 * @param {string[][]} rows - Day keys of each row of the grid
 * @param {(dayKey: string) => CalendarEntry[]} zonesOn - Zones running under a day
 * @return {ZoneTitleSpot[]} - One spot per zone on screen
 */

export const zoneTitleSpots = (
  rows: string[][],
  zonesOn: (dayKey: string) => CalendarEntry[]
): ZoneTitleSpot[] => {
  const best = new Map<string, ZoneTitleSpot>()

  rows.forEach((row, rowIndex) => {
    const open = new Map<string, ZoneTitleSpot>()

    row.forEach((dayKey, column) => {
      const here = zonesOn(dayKey)

      for (const zone of here) {
        const run = open.get(zone.id)
        if (run) run.to = column
        else open.set(zone.id, { zone, row: rowIndex, from: column, to: column })
      }

      // A zone that stopped closes its run
      for (const [id, run] of open) {
        if (here.some((zone) => zone.id === id)) continue

        open.delete(id)
        keepWidest(best, run)
      }
    })

    for (const run of open.values()) keepWidest(best, run)
  })

  return [...best.values()]
}

/**
 * Keep a run when it is wider than the one held for its zone
 * @param {Map<string, ZoneTitleSpot>} best - Runs held
 * @param {ZoneTitleSpot} run - Candidate
 * @return {void}
 */

const keepWidest = (best: Map<string, ZoneTitleSpot>, run: ZoneTitleSpot): void => {
  const held = best.get(run.zone.id)
  if (!held || run.to - run.from > held.to - held.from) best.set(run.zone.id, run)
}

/**
 * Font size filling a run of days with a title, in container units
 * @param {string} title - Zone title
 * @param {string} cap - Largest size, as a CSS length
 * @return {string} - CSS font size
 */

export const zoneTitleSize = (title: string, cap: string): string => {
  const longest = Math.max(...title.split(/\s+/).map((word) => word.length), 1)
  // At most two lines, wider titles shrink
  const budget = Math.max(longest, Math.ceil(title.length / 2), 3)

  return `min(${cap}, ${(150 / budget).toFixed(1)}cqw)`
}

/**
 * Cut a month grid into its weeks
 * @param {T[]} days - Days of the grid, whole weeks
 * @return {T[][]} - Rows of seven
 */

export const chunkDays = <T>(days: T[]): T[][] =>
  Array.from({ length: Math.ceil(days.length / 7) }, (_, row) => days.slice(row * 7, row * 7 + 7))
