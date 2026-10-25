import { GROUP_OF_KIND, REPORT_GROUPS } from '@/declarations/lives/reportGroups'
import type { GroupCounts, InsightAction, InsightSample, InsightSlice } from './types'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Empty counts
 * @return {GroupCounts} - Zeros
 */

export const emptyCounts = (): GroupCounts =>
  Object.fromEntries(REPORT_GROUPS.map((group) => [group, 0])) as GroupCounts

/**
 * Slice index of an instant
 * @param {Date} at - Instant
 * @param {Date} start - Live start
 * @param {number} bucketMs - Slice width
 * @param {number} slices - Slice count
 * @return {number} - Index
 */

const indexOf = (at: Date, start: Date, bucketMs: number, slices: number): number =>
  Math.min(slices - 1, Math.max(0, Math.floor((at.getTime() - start.getTime()) / bucketMs)))

/**
 * Cut the live in slices
 * @param {Object} input - Rows of the live
 * @param {InsightAction[]} input.actions - Gestures done
 * @param {InsightSample[]} input.samples - Viewer counts
 * @param {Date} input.start - Live start
 * @param {Date} input.end - Live end
 * @param {number} input.bucketMinutes - Slice width
 * @return {InsightSlice[]} - Slices
 */

export const buildSlices = (input: {
  actions: InsightAction[]
  samples: InsightSample[]
  start: Date
  end: Date
  bucketMinutes: number
}): InsightSlice[] => {
  const bucketMs = input.bucketMinutes * MINUTE_MS
  const count = Math.max(1, Math.ceil((input.end.getTime() - input.start.getTime()) / bucketMs))
  const slices: InsightSlice[] = Array.from({ length: count }, (_, index) => ({
    at: new Date(input.start.getTime() + index * bucketMs).toISOString(),
    counts: emptyCounts(),
    total: 0,
    viewers: null,
  }))

  // Gestures into their family
  input.actions
    .filter((action) => action.succeeded)
    .forEach((action) => {
      const slice = slices[indexOf(action.occurredAt, input.start, bucketMs, count)]!
      slice.counts[GROUP_OF_KIND[action.kind]] += 1
      slice.total += 1
    })

  // Viewer mean per slice
  const sums = new Array<{ sum: number; n: number }>(count)
    .fill({ sum: 0, n: 0 })
    .map(() => ({ sum: 0, n: 0 }))
  input.samples.forEach((sample) => {
    const bucket = sums[indexOf(sample.at, input.start, bucketMs, count)]!
    bucket.sum += sample.viewers
    bucket.n += 1
  })
  sums.forEach((bucket, index) => {
    if (bucket.n > 0) slices[index]!.viewers = Math.round(bucket.sum / bucket.n)
  })

  return slices
}

/**
 * Running total of the slices
 * @param {InsightSlice[]} slices - Slices
 * @return {number[]} - Total after each slice
 */

export const cumulate = (slices: InsightSlice[]): number[] => {
  let total = 0

  return slices.map((slice) => (total += slice.total))
}
