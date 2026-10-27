import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { LUDO_SOUNDS, LUDO_TAKES } from '@/declarations/play/ludo/sounds'
import type { LudoSoundName, LudoTakeName } from '@/declarations/play/ludo/sounds'

/**
 * Ludo sound at the player's level
 * @param {LudoSoundName} sound - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playLudoSound = (sound: LudoSoundName, level = 1): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  if (!isMuted) playSound(LUDO_SOUNDS[sound], volume * level)
}

/**
 * One take of a sound heard often
 * @param {LudoTakeName} take - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playLudoTake = (take: LudoTakeName, level = 1): void => {
  const { isMuted, volume } = usePlaySoundStore.getState()
  const files = LUDO_TAKES[take]
  if (!isMuted) playSound(files[Math.floor(Math.random() * files.length)], volume * level)
}

/**
 * Every Ludo file fetched ahead
 * @return {void}
 */

export const preloadLudoSounds = (): void =>
  preloadSounds([...Object.values(LUDO_SOUNDS), ...Object.values(LUDO_TAKES).flat()])
