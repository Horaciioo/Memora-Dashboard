'use client'

import { useEffect, useState } from 'react'

/**
 * Debounced value
 * @param {TValue} value - Live value
 * @param {number} delay - Delay in ms
 * @return {TValue} - Settled value
 */

export const useDebouncedValue = <TValue>(value: TValue, delay: number): TValue => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
