'use client'

import { useEffect, useState } from 'react'

import type { TourSize } from '@/core/lib/tour/placement'

/**
 * Screen size, known once the page is in the browser
 * @return {TourSize | null} - Size or null while rendering on the server
 */

export const useViewportSize = (): TourSize | null => {
  const [size, setSize] = useState<TourSize | null>(null)

  useEffect(() => {
    const read = () => setSize({ width: window.innerWidth, height: window.innerHeight })

    read()
    window.addEventListener('resize', read)

    return () => window.removeEventListener('resize', read)
  }, [])

  return size
}
