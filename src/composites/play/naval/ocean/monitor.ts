import { frameWindow } from '@/core/lib/play/naval/quality'
import type { NavalTierName } from '@/utils/constants/play'

// Development only, stripped from production builds
const IS_WATCHED = process.env.NODE_ENV === 'development'
// Frames kept, and how often the summary refreshes
const KEPT = 120
const EVERY = 30

const script = IS_WATCHED ? frameWindow(KEPT) : null
let painted = 0

/**
 * Frame budget of the seas, read from the console as `__navalBudget`
 * @typedef {Object} NavalBudget
 */

interface NavalBudget {
  p50: number
  p95: number
  tier: NavalTierName
  painted: number
  particles: number
  strikes: number
}

/**
 * Script time of one painted frame, summed up in development
 * @param {number} ms - Script time
 * @param {NavalTierName} tier - Tier in use
 * @param {{ particles: number; strikes: number }} load - Effects on screen
 * @return {void}
 */

export const recordPaint = (
  ms: number,
  tier: NavalTierName,
  load: { particles: number; strikes: number }
): void => {
  if (!script) return
  script.add(ms)
  painted += 1
  if (painted % EVERY) return
  const budget: NavalBudget = {
    p50: Number(script.percentile(0.5).toFixed(2)),
    p95: Number(script.percentile(0.95).toFixed(2)),
    tier,
    painted,
    ...load,
  }
  ;(window as Window & { __navalBudget?: NavalBudget }).__navalBudget = budget
}
