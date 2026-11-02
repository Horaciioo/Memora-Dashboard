import { playChime, playSound, playSweep } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/playSound'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import type { GolfSoundName } from '@/declarations/play/golf/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Golf sound at the player's level
 * @param {GolfSoundName} sound - Sound
 * @param {number} level - Zero to one
 * @return {void}
 */

export const playGolfSound = (sound: GolfSoundName, level = 1): void => {
  playSound(GOLF_SOUNDS[sound], playLevelOf(PlayGames.Golf) * level)
}

// C major arpeggio of a power won
const POWER_CHIME = [659.25, 830.61, 987.77, 1318.51, 1661.22]

/**
 * Sparkle of a power picked up
 * @return {void}
 */

export const playPowerChime = (): void => {
  playChime(POWER_CHIME, playLevelOf(PlayGames.Golf))
}

// Boost zip pitch and length
const BOOST_SWEEP = { from: 220, to: 1400, seconds: 0.35 }

/**
 * Zip of a boost slab
 * @return {void}
 */

export const playBoostSweep = (): void => {
  playSweep(BOOST_SWEEP, playLevelOf(PlayGames.Golf))
}
