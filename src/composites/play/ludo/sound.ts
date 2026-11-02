import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/playSound'
import { LUDO_SOUNDS, LUDO_TAKES } from '@/declarations/play/ludo/sounds'
import type { LudoSoundName, LudoTakeName } from '@/declarations/play/ludo/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Ludo sound at the player's level
 * @param {LudoSoundName} sound - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playLudoSound = (sound: LudoSoundName, level = 1): void => {
  playSound(LUDO_SOUNDS[sound], playLevelOf(PlayGames.Ludo) * level)
}

/**
 * One take of a sound heard often
 * @param {LudoTakeName} take - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playLudoTake = (take: LudoTakeName, level = 1): void => {
  const files = LUDO_TAKES[take]
  playSound(files[Math.floor(Math.random() * files.length)], playLevelOf(PlayGames.Ludo) * level)
}

/**
 * Every Ludo file fetched ahead
 * @return {void}
 */

export const preloadLudoSounds = (): void =>
  preloadSounds([...Object.values(LUDO_SOUNDS), ...Object.values(LUDO_TAKES).flat()])
