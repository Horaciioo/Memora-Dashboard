/**
 * Counters over sliding windows, kept in memory
 * @typedef {Object} Sample
 * @property {number} at - Time in ms
 * @property {number} value - Duration or amount
 * @property {boolean} failed - Counted as an error
 */

export interface Sample {
  at: number
  value: number
  failed: boolean
}

/**
 * Figures of one key over one window
 * @typedef {Object} WindowFigures
 */

export interface WindowFigures {
  count: number
  errors: number
  p50: number
  p95: number
}

// Value at a share of a sorted list
const percentile = (sorted: number[], share: number): number =>
  sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))]

/**
 * Figures of samples inside a window
 * @param {Sample[]} samples - Samples, oldest first
 * @param {number} windowMs - Window length
 * @param {number} now - Current time in ms
 * @return {WindowFigures} - Count, errors and percentiles
 */

export const figuresOf = (samples: Sample[], windowMs: number, now: number): WindowFigures => {
  const inside = samples.filter((sample) => now - sample.at <= windowMs)
  const sorted = inside.map((sample) => sample.value).sort((a, b) => a - b)

  return {
    count: inside.length,
    errors: inside.filter((sample) => sample.failed).length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
  }
}

// Most samples one key holds
const SAMPLES_MAX = 5000

/**
 * Keyed ring of samples, old ones fall away
 * @typedef {Object} MetricSeries
 */

export interface MetricSeries {
  add: (key: string, value: number, failed?: boolean) => void
  read: (windowMinutes: number) => Record<string, WindowFigures>
}

/**
 * Series bounded in time and in keys
 * @param {number} keepMs - Longest age kept
 * @param {number} keysMax - Most keys kept
 * @param {() => number} [clock] - Time source
 * @return {MetricSeries} - Series
 */

export const createSeries = (
  keepMs: number,
  keysMax: number,
  clock: () => number = Date.now
): MetricSeries => {
  const store = new Map<string, Sample[]>()

  const add = (key: string, value: number, failed = false) => {
    const now = clock()
    const samples = store.get(key) ?? []
    samples.push({ at: now, value, failed })

    // Age out from the front
    while (samples.length > 0 && (now - samples[0].at > keepMs || samples.length > SAMPLES_MAX)) {
      samples.shift()
    }
    store.set(key, samples)

    // Least recently used key leaves first
    if (store.size > keysMax) store.delete(store.keys().next().value as string)
  }

  const read = (windowMinutes: number) => {
    const now = clock()

    return Object.fromEntries(
      [...store.entries()].map(([key, samples]) => [
        key,
        figuresOf(samples, windowMinutes * 60_000, now),
      ])
    )
  }

  return { add, read }
}

// Segment that names one row
const ROW_SEGMENT = /^(c[a-z0-9]{24}|[0-9a-f]{8}-[0-9a-f-]{27}|\d+)$/i

/**
 * Route with its row identifiers folded
 * @param {string} route - Method and path
 * @return {string} - Stable key
 */

export const routeKey = (route: string): string =>
  route
    .split('/')
    .map((segment) => (ROW_SEGMENT.test(segment) ? ':id' : segment))
    .join('/')
