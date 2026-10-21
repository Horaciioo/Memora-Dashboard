import type { CalendarEntry } from '@/types/calendar'

/**
 * Where a zone title is drawn
 * @typedef {Object} ZoneTitleSpot
 * @property {CalendarEntry} zone - Zone it names
 * @property {number} row - Index of the row it sits in
 * @property {number} from - First column, from zero
 * @property {number} to - Last column
 * @property {string[]} ids - Every zone the title names
 * @property {string} title - Titles of the zones sharing these days, joined
 */

export interface ZoneTitleSpot {
  zone: CalendarEntry
  row: number
  from: number
  to: number
  ids: string[]
  title: string
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
        else
          open.set(zone.id, {
            zone,
            row: rowIndex,
            from: column,
            to: column,
            ids: [zone.id],
            title: zone.title,
          })
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

  return mergeSpots([...best.values()])
}

/**
 * Join the titles of zones sharing days into one, so they never print over each other
 * @param {ZoneTitleSpot[]} spots - One title per zone
 * @return {ZoneTitleSpot[]} - One title per cluster of zones
 */

const mergeSpots = (spots: ZoneTitleSpot[]): ZoneTitleSpot[] => {
  const merged: ZoneTitleSpot[] = []

  for (const spot of [...spots].sort((a, b) => a.row - b.row || a.from - b.from)) {
    const last = merged.at(-1)

    if (last && last.row === spot.row && spot.from <= last.to) {
      last.to = Math.max(last.to, spot.to)
      last.ids.push(...spot.ids)
      last.title = `${last.title} & ${spot.title}`
    } else {
      merged.push({ ...spot, ids: [...spot.ids] })
    }
  }

  return merged
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
