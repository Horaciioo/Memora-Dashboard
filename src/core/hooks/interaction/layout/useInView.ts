'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tells once an element has come into view
 * @return {[RefObject<HTMLDivElement | null>, boolean]} - Ref to put on the element, whether it was seen
 */

export const useInView = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isSeen, setSeen] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || isSeen) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true)
      },
      { threshold: 0.4 }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [isSeen])

  return [ref, isSeen] as const
}
