import naval from '@/configurations/play/naval.json'
import type { NavalDeviceRules, NavalTier } from '@/core/lib/play/naval/quality'
import { readBoolean, readInteger, readNode, readNumber } from '@/declarations/configurations/readers'
import { NavalQualities } from '@/utils/constants/play'
import type { NavalTierName } from '@/utils/constants/play'

// Raw nodes
const quality = readNode(naval.quality, 'play/naval.quality')
const tiers = readNode(quality.tiers, 'play/naval.quality.tiers')
const device = readNode(quality.device, 'play/naval.quality.device')

/**
 * One tier read from the configuration
 * @param {NavalTierName} name - Tier
 * @return {NavalTier} - Tier
 */

const tierOf = (name: NavalTierName): NavalTier => {
  const path = `play/naval.quality.tiers.${name}`
  const raw = readNode(tiers[name], path)

  return {
    pixelRatio: readNumber(raw.pixelRatio, { path: `${path}.pixelRatio`, fallback: 1, min: 1, max: 3 }),
    particles: readInteger(raw.particles, { path: `${path}.particles`, fallback: 80, min: 0 }),
    life: readNumber(raw.life, { path: `${path}.life`, fallback: 0, min: 0, max: 1 }),
    follow: readBoolean(raw.follow, { path: `${path}.follow`, fallback: false }),
    shake: readNumber(raw.shake, { path: `${path}.shake`, fallback: 0, min: 0, max: 1 }),
  }
}

/**
 * Device threshold of the first pick
 * @param {keyof NavalDeviceRules} key - Threshold
 * @return {number} - Value
 */

const deviceRule = (key: keyof NavalDeviceRules): number =>
  readNumber(device[key], { path: `play/naval.quality.device.${key}`, fallback: 0, min: 0 })

/**
 * Effect tiers, auto pick and slow-frame rule
 * @type {Object}
 */

export const NAVAL_QUALITY = {
  tiers: {
    [NavalQualities.Full]: tierOf(NavalQualities.Full),
    [NavalQualities.Reduced]: tierOf(NavalQualities.Reduced),
    [NavalQualities.Minimal]: tierOf(NavalQualities.Minimal),
  } satisfies Record<NavalTierName, NavalTier>,
  device: {
    fullCores: deviceRule('fullCores'),
    fullMemoryGb: deviceRule('fullMemoryGb'),
    fullScreenPx: deviceRule('fullScreenPx'),
    minimalCores: deviceRule('minimalCores'),
    minimalMemoryGb: deviceRule('minimalMemoryGb'),
  } satisfies NavalDeviceRules,
  // Idle paint rate of the leanest tier
  ecoFps: readInteger(quality.ecoFps, { path: 'play/naval.quality.ecoFps', fallback: 15, min: 1 }),
  // Frames slower than this for that long drop a tier
  slow: {
    slowFrameMs: readNumber(quality.slowFrameMs, {
      path: 'play/naval.quality.slowFrameMs',
      fallback: 20,
      min: 1,
    }),
    slowForMs: readInteger(quality.slowForMs, {
      path: 'play/naval.quality.slowForMs',
      fallback: 2000,
      min: 0,
    }),
  },
}
