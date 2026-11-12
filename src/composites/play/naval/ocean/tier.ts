import { firstTier, lowerTier, slowWatch } from '@/core/lib/play/naval/quality'
import type { NavalDevice, NavalTier } from '@/core/lib/play/naval/quality'
import { NAVAL_QUALITY } from '@/declarations/play/naval/quality'
import { NavalQualities } from '@/utils/constants/play'
import type { NavalQualityName, NavalTierName } from '@/utils/constants/play'

// Shared by every sea of the page: one drop lowers them all, never back up
let picked: NavalTierName | null = null
let forced: NavalQualityName = NavalQualities.Auto
const isSlow = slowWatch(NAVAL_QUALITY.slow)

/**
 * Device traits, unknown ones read as capable
 * @return {NavalDevice} - Device
 */

const deviceOf = (): NavalDevice => {
  const { hardwareConcurrency, deviceMemory } = navigator as Navigator & { deviceMemory?: number }

  return {
    ratio: window.devicePixelRatio || 1,
    cores: hardwareConcurrency || NAVAL_QUALITY.device.fullCores,
    memoryGb: deviceMemory ?? NAVAL_QUALITY.device.fullMemoryGb,
    screenPx: Math.max(window.screen.width, window.screen.height),
  }
}

/**
 * Tier in use, the forced choice first
 * @return {{ name: NavalTierName; tier: NavalTier }} - Tier
 */

export const currentTier = (): { name: NavalTierName; tier: NavalTier } => {
  picked ??= firstTier(deviceOf(), NAVAL_QUALITY.device)
  const name = forced === NavalQualities.Auto ? picked : forced

  return { name, tier: NAVAL_QUALITY.tiers[name] }
}

/**
 * Forced choice from the settings, auto by default
 * @param {NavalQualityName} quality - Choice
 * @return {void}
 */

export const forceQuality = (quality: NavalQualityName): void => {
  forced = quality
}

/**
 * Frame time at full pace, a long slow spell drops the auto tier
 * @param {number} ms - Time since the previous frame
 * @param {number} now - Clock
 * @return {boolean} - Tier dropped
 */

export const reportFrame = (ms: number, now: number): boolean => {
  if (forced !== NavalQualities.Auto || !isSlow(ms, now)) return false
  const { name } = currentTier()
  picked = lowerTier(name)

  return picked !== name
}
