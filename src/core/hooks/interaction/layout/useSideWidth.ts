'use client'

import { useCallback, useEffect, useState } from 'react'

import { MODVIEW_SIDE_WIDTH } from '@/declarations/ui/variants'

// One save per browser
const STORAGE_KEY = 'memora:modview:side-width:v1'

// Starts at its widest
const { start: MAX_WIDTH, min: MIN_WIDTH } = MODVIEW_SIDE_WIDTH

const clamp = (width: number): number => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))

/**
 * Width of the column holding the sanctions panel, stretched by hand and kept in the browser
 * @return {{ width: number, resize: (pixels: number) => void }} - Width and its change
 */

export const useSideWidth = () => {
  const [width, setWidth] = useState<number>(MAX_WIDTH)

  // The save of this browser takes over once mounted
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(STORAGE_KEY))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isFinite(saved) && saved > 0) setWidth(clamp(saved))
    } catch {
      // The default stands
    }
  }, [])

  const resize = useCallback((pixels: number) => {
    setWidth((current) => {
      const next = Number.isFinite(pixels) ? clamp(current - pixels) : current
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // The width lasts for the visit
      }

      return next
    })
  }, [])

  return { width, resize }
}
