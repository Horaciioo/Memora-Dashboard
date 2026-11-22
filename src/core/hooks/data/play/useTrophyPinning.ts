'use client'

import { usePlayPins } from '@/core/hooks/data/play/usePlayPins'
import { PLAY_PIN_MAX } from '@/declarations/play'

/**
 * Pin state of each trophy on the showcase
 * @param {string[]} pins - Pinned trophy keys
 * @param {boolean} canPin - The reader owns the showcase
 * @return {Function} - Pin controls of one trophy
 */

export const useTrophyPinning = (pins: string[], canPin: boolean) => {
  const { isSaving, save } = usePlayPins()

  return (key: string, reached: boolean) => {
    const isPinned = pins.includes(key)
    if (!canPin || !reached || (!isPinned && pins.length >= PLAY_PIN_MAX)) return null

    return {
      isPinned,
      isSaving,
      onToggle: () => void save(isPinned ? pins.filter((pin) => pin !== key) : [...pins, key]),
    }
  }
}
