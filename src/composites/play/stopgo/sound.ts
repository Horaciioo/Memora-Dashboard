import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { STOPGO_SOUNDS } from '@/declarations/play/stopgo/sounds'
import type { StopGoSoundName } from '@/declarations/play/stopgo/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Stop & Go sound at the player's level
 * @param {StopGoSoundName} sound - Sound
 * @param {number} [level] - Zero to one
 * @return {void}
 */

export const playStopGoSound = (sound: StopGoSoundName, level = 1): void => {
  playSound(STOPGO_SOUNDS[sound], playLevelOf(PlayGames.StopGo) * level)
}

/**
 * Every Stop & Go file fetched ahead
 * @return {void}
 */

export const preloadStopGoSounds = (): void => preloadSounds(Object.values(STOPGO_SOUNDS))
