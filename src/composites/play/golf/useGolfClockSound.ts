'use client'

import { useEffect } from 'react'

import { playGolfSound } from '@/composites/play/golf/sound'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

/**
 * Tick each last second
 * @param {number} left - Seconds left
 * @return {void}
 */

export const useGolfClockSound = (left: number): void => {
  const second = Math.ceil(left)
  const isLow = second > 0 && second <= GOLF_SETTINGS.clockLowSeconds

  // Once per second
  useEffect(() => {
    if (isLow) playGolfSound('clock')
  }, [isLow, second])
}
