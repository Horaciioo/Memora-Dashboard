'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Horizontal pages that snap, the open one followed from the scroll
 * @param {number} initial - Page shown first
 * @return {Object} - Scroller ref, open page and a way to reach another
 */

export const useSnapPager = (initial: number) => {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(initial)
  const latest = useRef(initial)

  // First paint already on the right page
  useLayoutEffect(() => {
    const scroller = ref.current
    if (scroller) scroller.scrollLeft = initial * scroller.clientWidth
  }, [initial])

  // A turned screen keeps the page
  useEffect(() => {
    const scroller = ref.current
    if (!scroller) return

    const observer = new ResizeObserver(() => {
      scroller.scrollLeft = latest.current * scroller.clientWidth
    })
    observer.observe(scroller)

    return () => observer.disconnect()
  }, [])

  const onScroll = useCallback(() => {
    const scroller = ref.current
    if (!scroller || scroller.clientWidth === 0) return
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth)
    latest.current = next
    setIndex(next)
  }, [])

  const goTo = useCallback((page: number) => {
    const scroller = ref.current
    scroller?.scrollTo({ left: page * scroller.clientWidth, behavior: 'smooth' })
  }, [])

  // Land on a page at once, when the pages were shuffled under the open one
  const jumpTo = useCallback((page: number) => {
    const scroller = ref.current
    if (scroller) scroller.scrollLeft = page * scroller.clientWidth
    latest.current = page
    setIndex(page)
  }, [])

  return { ref, index, onScroll, goTo, jumpTo }
}
