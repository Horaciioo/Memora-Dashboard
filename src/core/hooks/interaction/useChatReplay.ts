'use client'

import { useEffect, useState } from 'react'

import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * State of a chat replay
 * @typedef {Object} ChatReplay
 * @property {number} shown - Lines on screen
 * @property {boolean} playing - Replay running
 * @property {() => void} replay - Empties the chat and fills it line by line
 */

export interface ChatReplay {
  shown: number
  playing: boolean
  replay: () => void
}

/**
 * Play a chat back like a short clip: the lines arrive one after the other. At rest the whole chat is on screen
 * @param {number} total - Lines of the chat
 * @param {boolean} [autoplay] - Starts playing on arrival
 * @return {ChatReplay} - Replay state
 */

export const useChatReplay = (total: number, autoplay = false): ChatReplay => {
  const [shown, setShown] = useState(autoplay ? 0 : total)
  const [run, setRun] = useState(autoplay ? 1 : 0)

  useEffect(() => {
    if (run === 0) return

    // Calm mode keeps the chat whole
    if (prefersReducedMotion()) {
      const settle = setTimeout(() => setShown(total), 0)

      return () => clearTimeout(settle)
    }

    let count = 0
    const timer = setInterval(() => {
      count += 1
      setShown(count)
      if (count >= total) clearInterval(timer)
    }, ACADEMY_SETTINGS.chatLineDelayMs)

    return () => clearInterval(timer)
  }, [run, total])

  return {
    shown,
    playing: shown < total,
    // The chat empties at once
    replay: () => {
      setShown(0)
      setRun((current) => current + 1)
    },
  }
}
