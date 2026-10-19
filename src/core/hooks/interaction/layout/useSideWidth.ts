'use client'

import { useCallback, useEffect, useState } from 'react'

// One save per browser
const STORAGE_KEY = 'memora:modview:side-width:v1'

// Width it starts at, as w-72, and the most it ever gets
const DEFAULT_WIDTH = 288
const MAX_WIDTH = DEFAULT_WIDTH

// Narrowest it gets: the chat wins a little room, no more
const MIN_WIDTH = 208

const clamp = (width: number): number => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))

/**
 * Width of the column holding the sanctions panel, stretched by hand and kept in the browser
 * @return {{ width: number, resize: (pixels: number) => void }} - Width and its change
 */

export const useSideWidth = () => {
  const [width, setWidth] = useState(DEFAULT_WIDTH)

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
