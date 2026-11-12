'use client'

import { useEffect, useState } from 'react'

import { PLAY_LOADING } from '@/declarations/play'

/**
 * Bar that eases toward its ceiling while a game loads, never claims it is done
 * @return {number} - Progress, 0 to 100
 */

export const usePlayLoadingProgress = (): number => {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timer = setInterval(
      () => setValue((now) => now + (PLAY_LOADING.ceiling - now) * PLAY_LOADING.ease),
      PLAY_LOADING.tickMs
    )

    return () => clearInterval(timer)
  }, [])

  return value
}
