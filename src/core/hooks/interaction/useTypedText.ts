'use client'

import { useEffect, useState } from 'react'

/**
 * Text written letter by letter
 * @param {string} text - Full text
 * @param {boolean} isOn - Writing
 * @param {number} durationMs - Time to write it all
 * @return {string} - Letters so far
 */

export const useTypedText = (text: string, isOn: boolean, durationMs: number): string => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isOn) return

    // One letter per tick
    const timer = setInterval(
      () => setCount((current) => Math.min(current + 1, text.length)),
      durationMs / text.length
    )

    return () => {
      clearInterval(timer)
      setCount(0)
    }
  }, [text, isOn, durationMs])

  return isOn ? text.slice(0, count) : ''
}
