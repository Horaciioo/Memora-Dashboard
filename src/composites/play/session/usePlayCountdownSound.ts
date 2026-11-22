import { useEffect, useRef } from 'react'

import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { playLevelOf } from '@/core/store/play/playSound'
import { PLAY_COUNTDOWN_SOUNDS, PLAY_VOLUME } from '@/declarations/play/sounds'
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
  isSilentGame: boolean,
  game: PlayGameName
): void => {
  const last = useRef(seconds)
  const isOff = usePlayPrefsStore((state) => state.isCountdownOff)
  const isSilent = isSilentGame || isOff

  useEffect(() => preloadSounds(Object.values(PLAY_COUNTDOWN_SOUNDS)), [])

  useEffect(() => {
    last.current = seconds
    if (!isSilent) playSound(PLAY_COUNTDOWN_SOUNDS.tick, playLevelOf(game) * PLAY_VOLUME.tick)
  }, [seconds, isSilent, game])

  // The count leaves the screen after its last number
  useEffect(
    () => () => {
      if (!isSilent && last.current === 1) playSound(PLAY_COUNTDOWN_SOUNDS.go, playLevelOf(game))
    },
    [isSilent, game]
  )
}
