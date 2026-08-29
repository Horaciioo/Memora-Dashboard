'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

// Room kept between the panel and the viewport edge
const EDGE_MARGIN = 8

// Gap between the trigger and its panel
const PANEL_GAP = 4

/**
 * Sizing knobs of an anchored panel
 * @typedef {Object} AnchoredPanelOptions
 * @property {boolean} [matchTriggerWidth] - Stretch the panel to the trigger
 * @property {number} [minWidth] - Narrowest matched width
 */

export interface AnchoredPanelOptions {
  matchTriggerWidth?: boolean
  minWidth?: number
}

/**
 * State and refs of an anchored panel
 * @typedef {Object} AnchoredPanel
 * @property {boolean} isOpen - Panel is shown
 * @property {() => void} open - Show the panel
 * @property {() => void} close - Hide it and refocus the trigger
 * @property {(open: boolean) => void} setOpen - Raw open setter
 * @property {RefObject<HTMLButtonElement | null>} triggerRef - Trigger ref
 * @property {RefObject<HTMLDivElement | null>} panelRef - Panel ref
 */

export interface AnchoredPanel {
  isOpen: boolean
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
  triggerRef: RefObject<HTMLButtonElement | null>
  panelRef: RefObject<HTMLDivElement | null>
}

/**
 * Float a panel under its trigger, flipping above on overflow and dismissing on
 * escape, scroll or resize like a native popover
 * @param {AnchoredPanelOptions} [options] - Sizing knobs
 * @return {AnchoredPanel} - Panel state and refs
 */

export const useAnchoredPanel = (options: AnchoredPanelOptions = {}): AnchoredPanel => {
  const { matchTriggerWidth = false, minWidth = 0 } = options
  const [isOpen, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const open = useCallback(() => setOpen(true), [])

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Anchor under the trigger, re-placing when the panel resizes
  useLayoutEffect(() => {
    if (!isOpen) return

    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      const panel = panelRef.current
      if (!trigger || !panel) return

      if (matchTriggerWidth) panel.style.width = `${Math.max(trigger.width, minWidth)}px`

      // Flip above when the panel would spill past the bottom edge
      const height = panel.offsetHeight
      const room = window.innerHeight - trigger.bottom - EDGE_MARGIN
      const flip = height > room && trigger.top > room

      panel.style.left = `${Math.max(EDGE_MARGIN, Math.min(trigger.left, window.innerWidth - panel.offsetWidth - EDGE_MARGIN))}px`
      panel.style.top = flip
        ? `${Math.max(EDGE_MARGIN, trigger.top - height - PANEL_GAP)}px`
        : `${trigger.bottom + PANEL_GAP}px`
    }

    place()

    const observer = new ResizeObserver(place)
    if (panelRef.current) observer.observe(panelRef.current)

    return () => observer.disconnect()
  }, [isOpen, matchTriggerWidth, minWidth])

  // A scroll outside the panel, or a resize, breaks the anchor
  useEffect(() => {
    if (!isOpen) return

    const dismiss = (event: Event) => {
      if (event.type === 'scroll' && panelRef.current?.contains(event.target as Node)) return

      setOpen(false)
    }

    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)

    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [isOpen])

  // An overlay behind the panel listens for escape too, and must not answer first
  useEffect(() => {
    if (!isOpen) return

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onEscape, true)

    return () => document.removeEventListener('keydown', onEscape, true)
  }, [isOpen])

  return { isOpen, open, close, setOpen, triggerRef, panelRef }
}
