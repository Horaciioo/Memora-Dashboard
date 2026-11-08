'use client'

import { useCallback, useState } from 'react'

/**
 * Scale fitting a fixed width in its box
 * @param {number} designWidth - Width drawn at
 * @return {{ ref: (node: HTMLElement | null) => void, scale: number }} - Box ref and scale
 */

export const useFitScale = (designWidth: number) => {
  const [scale, setScale] = useState(1)

  // Follows the box width
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return

      const observer = new ResizeObserver(([entry]) =>
        setScale(entry.contentRect.width / designWidth)
      )
      observer.observe(node)

      return () => observer.disconnect()
    },
    [designWidth]
  )

  return { ref, scale }
}
