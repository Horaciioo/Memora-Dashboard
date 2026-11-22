'use client'

import { useCallback } from 'react'

/**
 * Publishes a box height as a CSS variable on its stage, so siblings can stack on it
 * @param {string} name - Variable name
 * @return {(node: HTMLElement | null) => void} - Box ref
 */

export const useHeightVar = (name: string) =>
  useCallback(
    (node: HTMLElement | null) => {
      const stage = node?.closest<HTMLElement>('[data-play-stage]')

      if (!node || !stage) return

      const observer = new ResizeObserver(() =>
        stage.style.setProperty(name, `${node.offsetHeight}px`)
      )
      observer.observe(node)

      return () => {
        observer.disconnect()
        stage.style.removeProperty(name)
      }
    },
    [name]
  )
