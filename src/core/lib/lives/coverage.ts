/**
 * Stretch of a live
 * @typedef {Object} CoverageSpan
 * @property {Date} from - Start
 * @property {Date} to - End
 */

export interface CoverageSpan {
  from: Date
  to: Date
}

/**
 * Stretches of a live the platform feed was not received
 * @param {CoverageSpan[]} covered - Periods the feed was alive
 * @param {Date} start - Live start
 * @param {Date} end - Live end
 * @param {number} [minSeconds] - Shortest gap worth reporting
 * @return {CoverageSpan[]} - Blind stretches, in time order
 */

export const blindSpans = (
  covered: CoverageSpan[],
  start: Date,
  end: Date,
  minSeconds = 0
): CoverageSpan[] => {
  const sorted = [...covered].sort((a, b) => a.from.getTime() - b.from.getTime())
  const gaps: CoverageSpan[] = []
  let cursor = start.getTime()

  for (const span of sorted) {
    const from = Math.max(span.from.getTime(), start.getTime())
    const to = Math.min(span.to.getTime(), end.getTime())
    if (to <= cursor) continue
    if (from > cursor) gaps.push({ from: new Date(cursor), to: new Date(from) })
    cursor = Math.max(cursor, to)
  }
  if (cursor < end.getTime()) gaps.push({ from: new Date(cursor), to: end })

  return gaps.filter((gap) => gap.to.getTime() - gap.from.getTime() >= minSeconds * 1000)
}

/**
 * Seconds of a set of stretches
 * @param {CoverageSpan[]} spans - Stretches
 * @return {number} - Seconds
 */

export const spanSeconds = (spans: CoverageSpan[]): number =>
  Math.round(spans.reduce((sum, span) => sum + (span.to.getTime() - span.from.getTime()), 0) / 1000)

/**
 * Coverage of a live: where the log could not see
 * @typedef {Object} LiveCoverage
 * @property {{ from: string, to: string }[]} gaps - Stretches without the platform feed
 * @property {number} blindSeconds - Their total
 */

export interface LiveCoverage {
  gaps: { from: string; to: string }[]
  blindSeconds: number
}
