import { playChime, playSound, playSweep } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import type { GolfSoundName } from '@/declarations/play/golf/sounds'

/**
 * Golf sound at the player's level
 * @param {GolfSoundName} sound - Sound
 * @param {number} level - Zero to one
 * @return {void}
 */

export const playGolfSound = (sound: GolfSoundName, level = 1): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  if (!isMuted) playSound(GOLF_SOUNDS[sound], volume * level)
}

// C major arpeggio of a power won
const POWER_CHIME = [659.25, 830.61, 987.77, 1318.51, 1661.22]

/**
 * Sparkle of a power picked up
 * @return {void}
 */

export const playPowerChime = (): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  if (!isMuted) playChime(POWER_CHIME, volume)
}

// Boost zip pitch and length
const BOOST_SWEEP = { from: 220, to: 1400, seconds: 0.35 }

/**
 * Zip of a boost slab
 * @return {void}
 */

export const playBoostSweep = (): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  if (!isMuted) playSweep(BOOST_SWEEP, volume)
}
