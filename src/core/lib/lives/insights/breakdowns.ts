import { GROUP_OF_KIND } from '@/declarations/lives/reportGroups'
import type { InsightAction, LiveInsights } from './types'

// Longest reason label kept
const REASON_LENGTH = 48

/**
 * Most used reasons
 * @param {InsightAction[]} done - Gestures done
 * @param {number} limit - Rows kept
 * @return {LiveInsights['reasons']} - Reasons
 */

export const topReasons = (done: InsightAction[], limit: number): LiveInsights['reasons'] => {
  const counts = new Map<string, number>()
  done.forEach((action) => {
    const label = action.reason?.trim().toLowerCase().slice(0, REASON_LENGTH)
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
}

/**
 * Viewers sanctioned more than once
 * @param {InsightAction[]} done - Gestures done
 * @param {number} limit - Rows kept
 * @return {LiveInsights['repeatTargets']} - Targets
 */

export const repeatTargets = (
  done: InsightAction[],
  limit: number
): LiveInsights['repeatTargets'] => {
  const counts = new Map<string, number>()
  done.forEach((action) => {
    // Only gestures that sanction
    const group = GROUP_OF_KIND[action.kind]
    if (action.targetLogin && group !== 'other') {
      counts.set(action.targetLogin, (counts.get(action.targetLogin) ?? 0) + 1)
    }
  })

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([login, count]) => ({ login, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
}

/**
 * Heat rows, one per moderator
 * @param {InsightAction[]} done - Gestures done
 * @param {number} slices - Slice count
 * @param {(action: InsightAction) => number} indexOf - Slice of a gesture
 * @return {LiveInsights['heat']} - Rows
 */

export const heatRows = (
  done: InsightAction[],
  slices: number,
  indexOf: (action: InsightAction) => number
): LiveInsights['heat'] => {
  const rows = new Map<string, LiveInsights['heat'][number]>()
  done.forEach((action) => {
    const row = rows.get(action.actorKey) ?? {
      key: action.actorKey,
      name: action.actorName,
      counts: new Array<number>(slices).fill(0),
    }
    row.counts[indexOf(action)]! += 1
    rows.set(action.actorKey, row)
  })

  return [...rows.values()].sort(
    (left, right) =>
      right.counts.reduce((a, b) => a + b, 0) - left.counts.reduce((a, b) => a + b, 0)
  )
}
