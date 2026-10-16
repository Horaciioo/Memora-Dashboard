'use client'

import { useEffect, useState } from 'react'

import { prefersReducedMotion } from '@/utils/motion'

/**
 * Reveal a text one character at a time
 * @param {string} text - Full text
 * @param {number} [stepMs] - Delay per character
 * @return {string} - Part shown so far
 */

export const useTypewriter = (text: string, stepMs: number = 32): string => {
  const [shown, setShown] = useState({ text, length: text.length })

  // A new text starts over
  if (shown.text !== text) setShown({ text, length: prefersReducedMotion() ? text.length : 0 })

  useEffect(() => {
    if (shown.length >= text.length) return

    const timer = window.setTimeout(
      () => setShown((current) => ({ ...current, length: current.length + 1 })),
      stepMs
    )

    return () => window.clearTimeout(timer)
  }, [shown.length, stepMs, text.length])

  return text.slice(0, shown.length)
}
