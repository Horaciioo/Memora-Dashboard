import type { ModAct } from '@/types/modview'

// Acts that sanction a viewer
const COUNTED_KINDS = ['delete', 'warn', 'timeout', 'ban']

/**
 * Viewer an act is about, never another
 * @param {ModAct} act - Act
 * @return {string | null} - Key
 */

const targetKey = (act: ModAct): string | null => act.targetId ?? act.target?.toLowerCase() ?? null

/**
 * Rank of each sanction among those of the same viewer inside the window
 * @param {ModAct[]} acts - Acts, any order
 * @param {number} windowMinutes - Look-back window
 * @return {Map<string, number>} - Rank by act, 2 is the second in the window
 */

export const repeatRanks = (acts: ModAct[], windowMinutes: number): Map<string, number> => {
  const span = windowMinutes * 60_000
  const seen = new Map<string, number[]>()
  const ranks = new Map<string, number>()

  // Oldest first, so each act counts those before it
  const ordered = acts
    .filter((act) => COUNTED_KINDS.includes(act.kind) && targetKey(act))
    .sort((left, right) => Date.parse(left.at) - Date.parse(right.at))
  for (const act of ordered) {
    const key = targetKey(act)!
    const at = Date.parse(act.at)
    const recent = (seen.get(key) ?? []).filter((moment) => at - moment <= span)
    recent.push(at)
    seen.set(key, recent)
    ranks.set(act.id, recent.length)
  }

  return ranks
}
