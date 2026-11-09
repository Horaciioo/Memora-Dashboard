import { useEffect, useRef } from 'react'

import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/play/playSound'
import { PLAY_COUNTDOWN_SOUNDS } from '@/declarations/play/sounds'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Tick on each number, a start sound when the count ends
 * @param {number} seconds - Seconds left
 * @param {boolean} isSilent - Game plays its own
 * @param {PlayGameName} game - Game counting
 * @return {void}
 */

export const usePlayCountdownSound = (
  seconds: number,
  isSilent: boolean,
  game: PlayGameName
): void => {
  const last = useRef(seconds)

  useEffect(() => preloadSounds(Object.values(PLAY_COUNTDOWN_SOUNDS)), [])

  useEffect(() => {
    last.current = seconds
    if (!isSilent) playSound(PLAY_COUNTDOWN_SOUNDS.tick, playLevelOf(game) * 0.8)
  }, [seconds, isSilent, game])

  // The count leaves the screen after its last number
  useEffect(
    () => () => {
      if (!isSilent && last.current === 1) playSound(PLAY_COUNTDOWN_SOUNDS.go, playLevelOf(game))
    },
    [isSilent, game]
  )
}
