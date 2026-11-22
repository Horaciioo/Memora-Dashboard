import { SECOND_MS } from '@/utils/constants/time'

/**
 * Stretch a member moderated
 * @typedef {Object} StintRow
 * @property {string} accountId - Member
 * @property {Date} startedAt - Stretch start
 * @property {Date | null} stoppedAt - Stretch end, none while open
 */

export interface StintRow {
  accountId: string
  startedAt: Date
  stoppedAt: Date | null
}

/**
 * Moderation time of one member
 * @typedef {Object} StintTotal
 * @property {string} accountId - Member
 * @property {number} seconds - Time moderated
 * @property {Date} from - First start
 * @property {Date} to - Last end
 */

export interface StintTotal {
  accountId: string
  seconds: number
  from: Date
  to: Date
}

/**
 * Closed stretch, the end settled
 * @typedef {Object} Span
 * @property {number} start - Start in milliseconds
 * @property {number} end - End in milliseconds
 */

interface Span {
  start: number
  end: number
}

/**
 * Settle the ends and merge the stretches that overlap, so a moment counts once
 * @param {StintRow[]} rows - Stretches
 * @param {Date} cap - End given to a stretch still open
 * @return {Span[]} - Disjoint stretches, earliest first
 */

const mergeSpans = (rows: StintRow[], cap: Date): Span[] => {
  const spans = rows
    .map((row) => ({
      start: +row.startedAt,
      end: Math.max(+row.startedAt, +(row.stoppedAt ?? cap)),
    }))
    .sort((left, right) => left.start - right.start)

  return spans.reduce<Span[]>((merged, span) => {
    const last = merged[merged.length - 1]
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end)
    else merged.push({ ...span })

    return merged
  }, [])
}

/**
 * Fold the stretches of a live into a total per member, overlaps counted once
 * @param {StintRow[]} rows - Stretches
 * @param {Date} cap - End given to a stretch still open
 * @return {StintTotal[]} - Totals, earliest start first
 */

export const foldStints = (rows: StintRow[], cap: Date): StintTotal[] =>
  [...Map.groupBy(rows, (row) => row.accountId)]
    .map(([accountId, list]) => {
      const spans = mergeSpans(list, cap)
      const seconds = spans.reduce((sum, span) => sum + (span.end - span.start) / SECOND_MS, 0)

      return {
        accountId,
        seconds: Math.round(seconds),
        from: new Date(spans[0].start),
        to: new Date(spans[spans.length - 1].end),
      }
    })
    .sort((left, right) => +left.from - +right.from)

/**
 * Time moderated inside and outside the hours given
 * @param {StintRow[]} rows - Stretches of one member
 * @param {Date} cap - End given to a stretch still open
 * @param {{ from: Date, to: Date }} hours - Hours given
 * @return {{ inside: number, outside: number }} - Seconds each side
 */

export const windowFit = (
  rows: StintRow[],
  cap: Date,
  hours: { from: Date; to: Date }
): { inside: number; outside: number } => {
  let inside = 0
  let outside = 0

  mergeSpans(rows, cap).forEach(({ start, end }) => {
    const shared = Math.max(0, Math.min(end, +hours.to) - Math.max(start, +hours.from))
    inside += shared / SECOND_MS
    outside += (end - start - shared) / SECOND_MS
  })

  return { inside: Math.round(inside), outside: Math.round(outside) }
}

/**
 * Stretches a member moderated, read from the moments of their gestures: every slot holding a
 * gesture counts whole, neighbouring slots join
 * @param {Date[]} moments - Moments of the gestures of one member
 * @param {{ start: Date, end: Date, slotMs: number }} live - Live start, end and slot length
 * @return {{ startedAt: Date, stoppedAt: Date }[]} - Stretches, earliest first, none past the end
 */

export const actionStints = (
  moments: Date[],
  live: { start: Date; end: Date; slotMs: number }
): { startedAt: Date; stoppedAt: Date }[] => {
  const slots = [
    ...new Set(
      moments.map((moment) => Math.max(0, Math.floor((+moment - +live.start) / live.slotMs)))
    ),
  ].sort((left, right) => left - right)

  const runs = slots.reduce<{ first: number; last: number }[]>((list, slot) => {
    const run = list[list.length - 1]
    if (run && slot === run.last + 1) run.last = slot
    else list.push({ first: slot, last: slot })

    return list
  }, [])

  return runs.map((run) => {
    const startedAt = new Date(+live.start + run.first * live.slotMs)
    const end = +live.start + (run.last + 1) * live.slotMs

    return { startedAt, stoppedAt: new Date(Math.max(+startedAt, Math.min(end, +live.end))) }
  })
}
