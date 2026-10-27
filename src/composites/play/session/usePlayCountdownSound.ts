import { useEffect, useRef } from 'react'

import { playSound, preloadSounds } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { PLAY_COUNTDOWN_SOUNDS } from '@/declarations/play/sounds'

/**
 * Tick on each number, a start sound when the count ends
 * @param {number} seconds - Seconds left
 * @param {boolean} isSilent - Game plays its own
 * @return {void}
 */

export const usePlayCountdownSound = (seconds: number, isSilent: boolean): void => {
  const last = useRef(seconds)

  useEffect(() => preloadSounds(Object.values(PLAY_COUNTDOWN_SOUNDS)), [])

  useEffect(() => {
    last.current = seconds
    const { isMuted, volume } = usePlaySoundStore.getState()
    if (!isSilent && !isMuted) playSound(PLAY_COUNTDOWN_SOUNDS.tick, volume * 0.8)
  }, [seconds, isSilent])

  // The count leaves the screen after its last number
  useEffect(
    () => () => {
      const { isMuted, volume } = usePlaySoundStore.getState()
      if (!isSilent && !isMuted && last.current === 1) {
        playSound(PLAY_COUNTDOWN_SOUNDS.go, volume)
      }
    },
    [isSilent]
  )
}
