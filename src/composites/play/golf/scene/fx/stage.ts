import type { GolfPowerName } from '@/utils/constants/play'

export type GolfFxStage = 'cast' | 'aura' | 'end' | 'off'

/**
 * Local ms a power came on and went off on one screen
 * @typedef {Object} GolfPowerTimes
 */

export interface GolfPowerTimes {
  on: number
  off: number | null
}

export type GolfPowerClock = Map<GolfPowerName, GolfPowerTimes>

/**
 * Notes powers coming on or going off, those already on at first sight skip their entrance
 * @param {GolfPowerClock} clock - Times kept
 * @param {Set<GolfPowerName>} powers - Running powers
 * @param {number} now - Local ms
 * @param {boolean} isFirst - First frame seen
 * @return {void}
 */

export const tickPowers = (
  clock: GolfPowerClock,
  powers: Set<GolfPowerName>,
  now: number,
  isFirst: boolean
): void => {
  for (const power of powers) {
    const times = clock.get(power)
    if (!times || times.off !== null) clock.set(power, { on: isFirst ? -Infinity : now, off: null })
  }
  for (const [power, times] of clock) {
    if (!powers.has(power) && times.off === null) times.off = now
  }
}

/**
 * Stage of a power animation and its progress
 * @param {GolfPowerTimes | undefined} times - On and off
 * @param {number} now - Local ms
 * @param {{ castMs: number, endMs: number }} fx - Durations
 * @return {{ stage: GolfFxStage, t: number }} - Stage and share played
 */

export const fxStage = (
  times: GolfPowerTimes | undefined,
  now: number,
  { castMs, endMs }: { castMs: number; endMs: number }
): { stage: GolfFxStage; t: number } => {
  if (!times) return { stage: 'off', t: 1 }
  if (times.off !== null) {
    const t = (now - times.off) / Math.max(1, endMs)
    return t < 1 ? { stage: 'end', t: Math.max(0, t) } : { stage: 'off', t: 1 }
  }
  const t = (now - times.on) / Math.max(1, castMs)

  return t < 1 ? { stage: 'cast', t: Math.max(0, t) } : { stage: 'aura', t: 1 }
}

/**
 * Size from one value to another, overshooting then settling, in steps when asked
 * @param {number} from - Start size
 * @param {number} to - End size
 * @param {number} t - Zero to one
 * @param {number} steps - Steps of the change, one is smooth
 * @return {number} - Size
 */

export const sizeAt = (from: number, to: number, t: number, steps = 1): number => {
  const clamped = Math.min(1, Math.max(0, t))
  if (clamped >= 1) return to
  // Stepped growth, each step springing
  const step = Math.min(steps - 1, Math.floor(clamped * steps))
  const local = clamped * steps - step
  const spring = 1 - Math.cos(local * Math.PI * 1.5) * Math.exp(-local * 4)
  const share = (step + Math.min(1.2, spring)) / steps

  return from + (to - from) * share
}

/**
 * Squash and stretch of a size change, one when still
 * @param {number} t - Zero to one
 * @param {number} amount - Strength
 * @return {number} - Height stretch
 */

export const squashAt = (t: number, amount: number): number =>
  t <= 0 || t >= 1 ? 1 : 1 + amount * Math.sin(t * Math.PI * 3) * (1 - t)

/**
 * Share of a line already erased by the pencil
 * @param {number} ageMs - Since the power came on
 * @param {number} eraseMs - Erase length
 * @return {number} - Zero intact, one erased
 */

export const eraseShare = (ageMs: number, eraseMs: number): number =>
  Math.min(1, Math.max(0, ageMs / Math.max(1, eraseMs)))
