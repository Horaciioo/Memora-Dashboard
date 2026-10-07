'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Horizontal scroll track with paging arrows
 * @return {{ track: RefObject<HTMLDivElement | null>, canPrevious: boolean, canNext: boolean, page: (direction: -1 | 1) => void }} - Track ref, arrow states and pager
 */

export const useCarousel = () => {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ canPrevious: false, canNext: false })

  const measure = useCallback(() => {
    const node = track.current
    if (!node) return

    setEdges({
      canPrevious: node.scrollLeft > 4,
      canNext: node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const node = track.current
    if (!node) return

    measure()
    node.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(node)

    return () => {
      node.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure])

  // A page is most of the visible width
  const page = useCallback((direction: -1 | 1) => {
    const node = track.current
    node?.scrollBy({ left: direction * node.clientWidth * 0.85 })
  }, [])

  return { track, ...edges, page }
}
