'use client'

import { useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

// Glide transition
const GLIDE = [
  'transform var(--motion-duration-panel) var(--motion-ease-out)',
  'width var(--motion-duration-panel) var(--motion-ease-out)',
  'height var(--motion-duration-panel) var(--motion-ease-out)',
].join(', ')

/**
 * Box gliding under the selected tab
 * @param {string} selected - Selected tab key
 * @return {{ listRef: RefObject, boxRef: RefObject }} - Refs to attach
 */

export const useGlideBox = <List extends HTMLElement>(selected: string) => {
  const listRef = useRef<List | null>(null)
  const boxRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const box = boxRef.current
    if (!list || !box) return

    // Place on the open tab
    const place = (animated: boolean) => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]')
      if (!tab) return

      box.style.transition = animated && !prefersReducedMotion() ? GLIDE : 'none'
      box.style.width = `${tab.offsetWidth}px`
      box.style.height = `${tab.offsetHeight}px`
      box.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`
      box.style.opacity = '1'
    }

    // First paint snaps
    place(box.style.opacity === '1')

    // Later layout changes snap
    const observer = new ResizeObserver(() => place(false))
    observer.observe(list)
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab))

    return () => observer.disconnect()
  }, [selected])

  return { listRef, boxRef }
}
