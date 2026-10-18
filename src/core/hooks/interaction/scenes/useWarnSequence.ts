'use client'

import { useEffect, useState } from 'react'

// Gap between two typed letters
const LETTER_MS = 26
// Waits between the beats after typing
const BEATS_MS = [550, 1500, 1300, 900]

/**
 * Beat of a warning: typed, sent, answered, written in the history, finished
 * @typedef {0 | 1 | 2 | 3 | 4} WarnStage
 */

export type WarnStage = 0 | 1 | 2 | 3 | 4

/**
 * Play a warning: the command is typed fast, sent, the viewer answers, the history keeps it
 * @param {boolean} isActive - Starts when true
 * @param {string} text - What gets typed
 * @return {{ typed: string, stage: WarnStage }} - Typed so far and the beat
 */

export const useWarnSequence = (isActive: boolean, text: string) => {
  const [count, setCount] = useState(0)
  const [stage, setStage] = useState<WarnStage>(0)

  // Letters arrive one by one
  useEffect(() => {
    if (!isActive) return

    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current + 1 >= text.length) window.clearInterval(timer)

        return Math.min(current + 1, text.length)
      })
    }, LETTER_MS)

    return () => window.clearInterval(timer)
  }, [isActive, text])

  // Then each beat follows the last
  useEffect(() => {
    if (!isActive || count < text.length) return

    const timers = BEATS_MS.map((_, index) =>
      window.setTimeout(
        () => setStage((index + 1) as WarnStage),
        BEATS_MS.slice(0, index + 1).reduce((sum, wait) => sum + wait, 0)
      )
    )

    return () => timers.forEach(window.clearTimeout)
  }, [isActive, count, text.length])

  return { typed: stage === 0 ? text.slice(0, count) : '', stage }
}
