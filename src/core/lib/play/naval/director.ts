import type { NavalStrikeView } from '@/core/lib/play/naval/state'

/**
 * Strikes to start, to drop and to keep waiting
 * @typedef {Object} NavalPlan
 */

export interface NavalPlan {
  start: Array<{ strike: NavalStrikeView; isShort: boolean }>
  skip: NavalStrikeView[]
  wait: NavalStrikeView[]
}

/**
 * Plan of the strike queue
 * @typedef {Object} NavalPlanInput
 * @property {NavalStrikeView[]} queue - Waiting, oldest first
 * @property {NavalStrikeView[]} playing - On screen
 * @property {number} viewer - Viewer's seat
 * @property {number} lanes - Strikes at once
 * @property {number} backlog - Waiting per match before a jump
 * @property {boolean} isCalm - Impact only
 */

export interface NavalPlanInput {
  queue: NavalStrikeView[]
  playing: NavalStrikeView[]
  viewer: number
  lanes: number
  backlog: number
  isCalm: boolean
}

/**
 * Strike that touches the viewer
 * @param {NavalStrikeView} strike - Strike
 * @param {number} viewer - Viewer's seat
 * @return {boolean} - Near
 */

export const isNearStrike = (strike: NavalStrikeView, viewer: number): boolean =>
  viewer >= 0 && (strike.shooter === viewer || strike.target === viewer)

/**
 * Which strikes start now: one per match, a few at once, far ones short when crowded
 * @param {NavalPlanInput} input - Queue and screen
 * @return {NavalPlan} - Plan
 */

export const planStrikes = ({
  queue,
  playing,
  viewer,
  lanes,
  backlog,
  isCalm,
}: NavalPlanInput): NavalPlan => {
  const plan: NavalPlan = { start: [], skip: [], wait: [] }

  // Far behind in a match: jump to its newest
  const byMatch = Map.groupBy(queue, (strike) => strike.match)
  const kept = new Set<NavalStrikeView>()
  for (const strikes of byMatch.values()) {
    const held = strikes.length > backlog ? strikes.slice(-1) : strikes
    plan.skip.push(...strikes.slice(0, strikes.length - held.length))
    held.forEach((strike) => kept.add(strike))
  }

  // Oldest head of each free match, within the lanes
  const busy = new Set(playing.map((strike) => strike.match))
  for (const strike of queue) {
    if (!kept.has(strike)) continue
    const isFree = !busy.has(strike.match) && playing.length + plan.start.length < lanes
    if (!isFree) {
      plan.wait.push(strike)
      busy.add(strike.match)
      continue
    }
    const isCrowded = playing.length + plan.start.length > 0
    plan.start.push({ strike, isShort: isCalm || (isCrowded && !isNearStrike(strike, viewer)) })
    busy.add(strike.match)
  }

  return plan
}

/**
 * Screen angle the shooter fires from, seats fanned below the sea
 * @param {number} shooter - Shooter's seat
 * @param {number} target - Target's seat
 * @param {number} seats - Captains at the table
 * @return {number} - Radians, down is a half pi
 */

export const entryAngle = (shooter: number, target: number, seats: number): number => {
  const count = Math.max(2, seats)
  const offset = (((shooter - target) % count) + count) % count

  return Math.PI / 2 + ((offset - count / 2) / count) * Math.PI
}
