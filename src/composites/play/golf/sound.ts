import { playChime, playSound, playSweep } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
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

// Air rushing past a ball dropping back
const RESPAWN_WHOOSH = { from: 900, to: 180, seconds: 0.22 }

/**
 * Whoosh of a lost ball dropping back on its spot
 * @return {void}
 */

export const playRespawnWhoosh = (): void => {
  playSweep(RESPAWN_WHOOSH, playLevelOf(PlayGames.Golf))
}

// Shorter fanfare of an own ball holed
const CUP_FANFARE = POWER_CHIME.slice(0, 3)

/**
 * Fanfare of an own ball holed
 * @return {void}
 */

export const playCupFanfare = (): void => {
  playChime(CUP_FANFARE, playLevelOf(PlayGames.Golf))
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

// Card sliding across the felt, card snapped on the table
const DECK_SLIDE = { from: 420, to: 1100, seconds: 0.12 }
const DECK_DEAL = { from: 1500, to: 600, seconds: 0.07 }

/**
 * Swish of a card of the tournament deck
 * @param {boolean} [isDeal] - Card dealt, else sliding
 * @return {void}
 */

export const playDeckCard = (isDeal = false): void => {
  playSweep(isDeal ? DECK_DEAL : DECK_SLIDE, playLevelOf(PlayGames.Golf) * 0.4)
}
