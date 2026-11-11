import { NavalQualities } from '@/utils/constants/play'
import type { NavalTierName } from '@/utils/constants/play'

/**
 * What a tier allows
 * @typedef {Object} NavalTier
 * @property {number} pixelRatio - Device pixel ceiling
 * @property {number} particles - Particle reserve
 * @property {number} life - Share of the living world, zero is still
 * @property {boolean} follow - Camera follows strikes
 * @property {number} shake - Share of the screen shake
 */

export interface NavalTier {
  pixelRatio: number
  particles: number
  life: number
  follow: boolean
  shake: number
}

/**
 * Device traits read on arrival
 * @typedef {Object} NavalDevice
 */

export interface NavalDevice {
  ratio: number
  cores: number
  memoryGb: number
  screenPx: number
}

/**
 * Device thresholds of the first pick
 * @typedef {Object} NavalDeviceRules
 */

export interface NavalDeviceRules {
  fullCores: number
  fullMemoryGb: number
  fullScreenPx: number
  minimalCores: number
  minimalMemoryGb: number
}

// Tiers from richest to leanest
const LADDER: NavalTierName[] = [
  NavalQualities.Full,
  NavalQualities.Reduced,
  NavalQualities.Minimal,
]

/**
 * Tier picked from the device, before any frame is measured
 * @param {NavalDevice} device - Device
 * @param {NavalDeviceRules} rules - Thresholds
 * @return {NavalTierName} - Tier
 */

export const firstTier = (device: NavalDevice, rules: NavalDeviceRules): NavalTierName => {
  if (device.cores < rules.minimalCores || device.memoryGb < rules.minimalMemoryGb) {
    return NavalQualities.Minimal
  }
  const isStrong =
    device.cores >= rules.fullCores &&
    device.memoryGb >= rules.fullMemoryGb &&
    device.screenPx >= rules.fullScreenPx

  return isStrong ? NavalQualities.Full : NavalQualities.Reduced
}

/**
 * Next tier down, the leanest stays
 * @param {NavalTierName} tier - Tier
 * @return {NavalTierName} - Lower tier
 */

export const lowerTier = (tier: NavalTierName): NavalTierName =>
  LADDER[Math.min(LADDER.length - 1, LADDER.indexOf(tier) + 1)] ?? NavalQualities.Minimal

/**
 * Rolling frame times and their percentiles
 * @typedef {Object} FrameWindow
 */

export interface FrameWindow {
  add: (ms: number) => void
  percentile: (share: number) => number
  count: () => number
}

/**
 * Fixed window of the last frame times, no allocation per frame
 * @param {number} length - Frames kept
 * @return {FrameWindow} - Window
 */

export const frameWindow = (length: number): FrameWindow => {
  const times = new Float32Array(length)
  const sorted = new Float32Array(length)
  let next = 0
  let filled = 0

  return {
    add: (ms) => {
      times[next] = ms
      next = (next + 1) % length
      filled = Math.min(length, filled + 1)
    },
    percentile: (share) => {
      if (!filled) return 0
      sorted.set(times.subarray(0, filled))
      const view = sorted.subarray(0, filled).sort()

      return view[Math.min(filled - 1, Math.floor(share * filled))] ?? 0
    },
    count: () => filled,
  }
}

/**
 * Slow-frame rule of the auto tier
 * @typedef {Object} SlowRule
 */

export interface SlowRule {
  slowFrameMs: number
  slowForMs: number
}

// Length of one judged spell, in milliseconds, and the share of slow frames that fails it
const SPELL_MS = 500
const SLOW_SHARE = 0.05

/**
 * Watch that asks for a lower tier once the p95 stays slow long enough, judged per half second
 * @param {SlowRule} rule - Threshold and patience
 * @return {(ms: number, now: number) => boolean} - Records a frame, true when the tier must drop
 */

export const slowWatch = (rule: SlowRule) => {
  let spellFrom: number | null = null
  let frames = 0
  let slow = 0
  let slowSince: number | null = null

  return (ms: number, now: number): boolean => {
    spellFrom ??= now
    frames += 1
    if (ms > rule.slowFrameMs) slow += 1
    if (now - spellFrom < SPELL_MS) return false
    const isSlowSpell = slow / frames > SLOW_SHARE
    slowSince = isSlowSpell ? (slowSince ?? spellFrom) : null
    spellFrom = now
    frames = 0
    slow = 0
    if (slowSince === null || now - slowSince < rule.slowForMs) return false
    slowSince = null

    return true
  }
}
