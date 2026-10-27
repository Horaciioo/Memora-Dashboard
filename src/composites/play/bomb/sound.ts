import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { BOMB_SOUNDS, BOMB_TAKES } from '@/declarations/play/bomb/sounds'
import type { BombSoundName, BombTakeName } from '@/declarations/play/bomb/sounds'

/**
 * Bomb Party sound at the player's level
 * @param {BombSoundName} sound - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playBombSound = (sound: BombSoundName, level = 1): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  if (!isMuted) playSound(BOMB_SOUNDS[sound], volume * level)
}

/**
 * One take of a sound heard often
 * @param {BombTakeName} take - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playBombTake = (take: BombTakeName, level = 1): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  const files = BOMB_TAKES[take]
  if (!isMuted) playSound(files[Math.floor(Math.random() * files.length)], volume * level)
}

/**
 * Every Bomb Party file fetched ahead
 * @return {void}
 */

export const preloadBombSounds = (): void =>
  preloadSounds([...Object.values(BOMB_SOUNDS), ...Object.values(BOMB_TAKES).flat()])
