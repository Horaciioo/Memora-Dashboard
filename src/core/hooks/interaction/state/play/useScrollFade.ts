'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Tells when a scroller still hides content below
 * @param {unknown[]} deps - Values that change its content
 * @return {Object} - Ref, scroll handler and flag
 */

export const useScrollFade = (deps: unknown[]) => {
  const ref = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState(false)
  const measure = useCallback(() => {
    const node = ref.current

    if (node) setHasMore(node.scrollHeight - node.scrollTop - node.clientHeight > 4)
  }, [])

  useEffect(measure, [measure, ...deps])

  return { ref, onScroll: measure, hasMore }
}
