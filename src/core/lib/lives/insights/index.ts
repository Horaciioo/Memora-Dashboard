import { heatRows, repeatTargets, topReasons } from './breakdowns'
import { buildSlices, cumulate } from './series'
import type { InsightAction, InsightSample, LiveInsights } from './types'

export { compareToBaseline } from './compare'
export type { BaselineRow } from './compare'
export type * from './types'

// Rows kept in a ranking
const RANK_SIZE = 8

/**
 * Stretch of a Livecon level over the live
 * @typedef {Object} InsightLevel
 */

export interface InsightLevel {
  level: number
  name: string
  from: Date
  to: Date | null
}

/**
 * Viewer figures of the samples
 * @param {InsightSample[]} samples - Viewer counts
 * @return {LiveInsights['viewers']} - Figures
 */

const viewerFigures = (samples: InsightSample[]): LiveInsights['viewers'] => {
  if (samples.length === 0) return null

  const top = samples.reduce((best, sample) => (sample.viewers > best.viewers ? sample : best))
  const sum = samples.reduce((total, sample) => total + sample.viewers, 0)

  return {
    peak: top.viewers,
    peakAt: top.at.toISOString(),
    average: Math.round(sum / samples.length),
  }
}

/**
 * Seconds between two gestures, median
 * @param {InsightAction[]} done - Gestures done
 * @return {number | null} - Seconds
 */

const medianGap = (done: InsightAction[]): number | null => {
  const times = done.map((action) => action.occurredAt.getTime()).sort((a, b) => a - b)
  const gaps = times.slice(1).map((time, index) => (time - times[index]!) / 1000)
  if (gaps.length === 0) return null

  return gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)]!
}

/**
 * Gestures and time per Livecon level
 * @param {InsightAction[]} done - Gestures done
 * @param {InsightLevel[]} levels - Levels in force
 * @param {Date} start - Live start
 * @param {Date} end - Live end
 * @return {LiveInsights['levels']} - Rows
 */

const levelRows = (
  done: InsightAction[],
  levels: InsightLevel[],
  start: Date,
  end: Date
): LiveInsights['levels'] => {
  const rows = new Map<number, LiveInsights['levels'][number]>()

  levels.forEach((entry) => {
    const from = Math.max(start.getTime(), entry.from.getTime())
    const to = Math.min(end.getTime(), (entry.to ?? end).getTime())
    const row = rows.get(entry.level) ?? {
      level: entry.level,
      name: entry.name,
      minutes: 0,
      actions: 0,
      perHour: 0,
    }
    row.minutes += Math.max(0, to - from) / 60000
    row.actions += done.filter(
      (action) => action.occurredAt.getTime() >= from && action.occurredAt.getTime() < to
    ).length
    rows.set(entry.level, row)
  })

  return [...rows.values()]
    .map((row) => ({
      ...row,
      minutes: Math.round(row.minutes),
      perHour: row.minutes > 0 ? (row.actions / row.minutes) * 60 : 0,
    }))
    .sort((left, right) => left.level - right.level)
}

/**
 * Build everything the Bilan charts draw
 * @param {Object} input - Rows of the live
 * @param {InsightAction[]} input.actions - Gestures
 * @param {InsightSample[]} input.samples - Viewer counts
 * @param {InsightLevel[]} input.levels - Livecon levels in force
 * @param {Date} input.start - Live start
 * @param {Date} input.end - Live end
 * @param {number} input.bucketMinutes - Slice width
 * @return {LiveInsights} - Insights
 */

export const buildInsights = (input: {
  actions: InsightAction[]
  samples: InsightSample[]
  levels: InsightLevel[]
  start: Date
  end: Date
  bucketMinutes: number
}): LiveInsights => {
  const done = input.actions.filter((action) => action.succeeded)
  const slices = buildSlices(input)
  const bucketMs = input.bucketMinutes * 60 * 1000
  const hours = Math.max((input.end.getTime() - input.start.getTime()) / 3600000, 1 / 60)
  const viewers = viewerFigures(input.samples)

  const sliceOf = (action: InsightAction) =>
    Math.min(
      slices.length - 1,
      Math.max(0, Math.floor((action.occurredAt.getTime() - input.start.getTime()) / bucketMs))
    )
  const heat = heatRows(done, slices.length, sliceOf)
  const busiest = heat[0]?.counts.reduce((a, b) => a + b, 0) ?? 0

  return {
    bucketMinutes: input.bucketMinutes,
    slices,
    cumulative: cumulate(slices),
    heat,
    reasons: topReasons(done, RANK_SIZE),
    repeatTargets: repeatTargets(done, RANK_SIZE),
    origins: {
      memora: done.filter((action) => action.origin === 'MEMORA').length,
      platform: done.filter((action) => action.origin === 'PLATFORM').length,
    },
    levels: levelRows(done, input.levels, input.start, input.end),
    viewers,
    perHour: done.length / hours,
    gapSeconds: medianGap(done),
    per1000Viewers: viewers && viewers.average > 0 ? (done.length / viewers.average) * 1000 : null,
    failureRate: input.actions.length > 0 ? 1 - done.length / input.actions.length : 0,
    busiestShare: done.length > 0 ? busiest / done.length : null,
  }
}
