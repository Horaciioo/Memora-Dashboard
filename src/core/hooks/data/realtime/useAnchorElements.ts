'use client'

import { useEffect, useState } from 'react'

import { elementOfAnchor } from '@/core/lib/realtime/anchors'

// Joins anchors into one dependency
const KEY_SEPARATOR = '\n'

/**
 * Live elements of anchors
 * @param {string[]} anchors - Anchor keys
 * @return {Map<string, HTMLElement>} - Found elements
 */

export const useAnchorElements = (anchors: string[]): Map<string, HTMLElement> => {
  const [elements, setElements] = useState<Map<string, HTMLElement>>(new Map())
  const key = anchors.join(KEY_SEPARATOR)

  useEffect(() => {
    const wanted = key ? key.split(KEY_SEPARATOR) : []
    let frame = 0

    // Keep the map when unchanged
    const resolve = () => {
      frame = 0
      const found = new Map<string, HTMLElement>()
      for (const anchor of wanted) {
        const element = elementOfAnchor(anchor)
        if (element) found.set(anchor, element)
      }
      setElements((known) =>
        known.size === found.size &&
        [...found].every(([anchor, element]) => known.get(anchor) === element)
          ? known
          : found
      )
    }

    resolve()
    if (!wanted.length) return

    // Tabs and edits swap elements
    const observer = new MutationObserver(() => {
      frame ||= window.requestAnimationFrame(resolve)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [key])

  return elements
}
