'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'

/**
 * State of a scene arriving message by message
 * @typedef {Object} PlungeScene
 * @property {number} shown - Messages on screen
 * @property {boolean} over - Every message has arrived
 * @property {() => void} restart - Back to an empty chat
 */

export interface PlungeScene {
  shown: number
  over: boolean
  restart: () => void
}

/**
 * Let a scene arrive at the pace of a real chat
 * @param {number} total - Messages of the scene
 * @param {boolean} running - Scene is playing
 * @param {(index: number) => void} onArrive - Called as each message lands
 * @return {PlungeScene} - Scene state
 */

export const usePlungeScene = (
  total: number,
  running: boolean,
  onArrive: (index: number) => void
): PlungeScene => {
  const [shown, setShown] = useState(0)
  const arrive = useRef(onArrive)

  // Latest handler
  useEffect(() => {
    arrive.current = onArrive
  }, [onArrive])

  // Next message on the timer
  useEffect(() => {
    if (!running || shown >= total) return

    const timer = setTimeout(
      () => {
        arrive.current(shown)
        setShown((count) => count + 1)
      },
      shown === 0 ? ACADEMY_SETTINGS.chatLineDelayMs : ACADEMY_SETTINGS.plungeLineDelayMs
    )

    return () => clearTimeout(timer)
  }, [running, shown, total])

  const restart = useCallback(() => setShown(0), [])

  return { shown, over: shown >= total, restart }
}
