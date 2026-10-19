'use client'

import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface FloatingRailProps {
  // Element the rail sits next to
  anchor: HTMLElement | null
  children: ReactNode
}

// Rail width in px, as w-72
const RAIL_WIDTH = 288

// Gap between anchor and rail
const RAIL_GAP = 8

// Where the anchor stands
interface Placement {
  top: number
  height: number
  left: number
}

/**
 * Rail floating beside an element, on the side with room
 * @param {HTMLElement | null} anchor - Neighbour element
 * @param {ReactNode} children - Rail
 * @return {JSX.Element | null}
 */

export const FloatingRail = ({ anchor, children }: FloatingRailProps) => {
  const [placement, setPlacement] = useState<Placement | null>(null)

  // Follow the anchor
  useLayoutEffect(() => {
    if (!anchor) return

    const place = () => {
      const box = anchor.getBoundingClientRect()
      const right = box.right + RAIL_GAP
      const fits = right + RAIL_WIDTH <= window.innerWidth
      setPlacement({
        top: box.top,
        height: box.height,
        left: fits ? right : Math.max(0, box.left - RAIL_GAP - RAIL_WIDTH),
      })
    }

    place()

    const observer = new ResizeObserver(place)
    observer.observe(anchor)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor])

  if (!anchor || !placement) return null

  return createPortal(
    <div className="fixed z-40 flex" style={placement}>
      {children}
    </div>,
    document.body
  )
}
