'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import { isKeyboardShift } from '@/core/lib/ui/keyboard'

// Room kept between the panel and the viewport edge
const EDGE_MARGIN = 8

// Gap between the trigger and its panel
const PANEL_GAP = 4

/**
 * Sizing knobs of an anchored panel
 * @typedef {Object} AnchoredPanelOptions
 * @property {boolean} [matchTriggerWidth] - Stretch the panel to the trigger
 * @property {number} [minWidth] - Narrowest matched width
 * @property {boolean} [prefersAbove] - Open upward whenever it fits
 */

export interface AnchoredPanelOptions {
  matchTriggerWidth?: boolean
  minWidth?: number
  prefersAbove?: boolean
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
 * Float a panel under its trigger
 * @param {AnchoredPanelOptions} [options] - Sizing knobs
 * @return {AnchoredPanel} - Panel state and refs
 */

export const useAnchoredPanel = (options: AnchoredPanelOptions = {}): AnchoredPanel => {
  const { matchTriggerWidth = false, minWidth = 0, prefersAbove = false } = options
  const [isOpen, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const open = useCallback(() => setOpen(true), [])

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Anchor under the trigger
  useLayoutEffect(() => {
    if (!isOpen) return

    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      const panel = panelRef.current
      if (!trigger || !panel) return

      if (matchTriggerWidth) panel.style.width = `${Math.max(trigger.width, minWidth)}px`

      // Flip above when the panel would spill past the bottom edge
      panel.style.maxHeight = ''
      const height = panel.offsetHeight
      const room = window.innerHeight - trigger.bottom - EDGE_MARGIN
      const above = trigger.top - EDGE_MARGIN
      const flip = prefersAbove ? height <= above || above > room : height > room && above > room

      // Panel shrinks to the side it sits on
      const space = (flip ? above : room) - PANEL_GAP
      if (height > space) panel.style.maxHeight = `${space}px`

      panel.style.left = `${Math.max(EDGE_MARGIN, Math.min(trigger.left, window.innerWidth - panel.offsetWidth - EDGE_MARGIN))}px`
      panel.style.top = flip
        ? `${Math.max(EDGE_MARGIN, trigger.top - Math.min(height, above - PANEL_GAP) - PANEL_GAP)}px`
        : `${trigger.bottom + PANEL_GAP}px`
    }

    place()

    const observer = new ResizeObserver(place)
    if (panelRef.current) observer.observe(panelRef.current)

    return () => observer.disconnect()
  }, [isOpen, matchTriggerWidth, minWidth, prefersAbove])

  // A scroll outside the panel
  useEffect(() => {
    if (!isOpen) return

    const width = window.innerWidth
    const dismiss = (event: Event) => {
      if (event.type === 'scroll' && panelRef.current?.contains(event.target as Node)) return
      // A keyboard opening must not close the panel it opened for
      if (isKeyboardShift(event, width)) return

      setOpen(false)
    }

    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)

    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [isOpen])

  // An overlay behind the panel listens for escape too
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
