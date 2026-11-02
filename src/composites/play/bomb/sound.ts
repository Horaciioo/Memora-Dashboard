import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/playSound'
import { BOMB_SOUNDS, BOMB_TAKES } from '@/declarations/play/bomb/sounds'
import type { BombSoundName, BombTakeName } from '@/declarations/play/bomb/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Bomb Party sound at the player's level
 * @param {BombSoundName} sound - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playBombSound = (sound: BombSoundName, level = 1): void => {
  playSound(BOMB_SOUNDS[sound], playLevelOf(PlayGames.Bomb) * level)
}

/**
 * One take of a sound heard often
 * @param {BombTakeName} take - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playBombTake = (take: BombTakeName, level = 1): void => {
  const files = BOMB_TAKES[take]
  playSound(files[Math.floor(Math.random() * files.length)], playLevelOf(PlayGames.Bomb) * level)
}

/**
 * Every Bomb Party file fetched ahead
 * @return {void}
 */

export const preloadBombSounds = (): void =>
  preloadSounds([...Object.values(BOMB_SOUNDS), ...Object.values(BOMB_TAKES).flat()])
