'use client'

import { useEffect, useState } from 'react'

import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'

/**
 * Drop a line now and then
 * @param {readonly string[]} lines - Lines to cycle
 * @param {boolean} isActive - Allowed to speak
 * @return {string | null} - Line shown
 */

export const useNudgeCycle = (lines: readonly string[], isActive: boolean): string | null => {
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive || lines.length === 0) return

    const { nudgeFirstSeconds, nudgeEverySeconds, nudgeShowSeconds } = ASSISTANT_SETTINGS
    let turn = 0
    let hide: ReturnType<typeof setTimeout> | undefined

    // Speak, then fall silent
    const speak = () => {
      setShown(lines[turn % lines.length])
      turn += 1
      hide = setTimeout(() => setShown(null), nudgeShowSeconds * 1000)
    }

    const first = setTimeout(speak, nudgeFirstSeconds * 1000)
    const every = setInterval(speak, nudgeEverySeconds * 1000)

    return () => {
      clearTimeout(first)
      clearInterval(every)
      clearTimeout(hide)
      setShown(null)
    }
  }, [lines, isActive])

  return isActive ? shown : null
}
