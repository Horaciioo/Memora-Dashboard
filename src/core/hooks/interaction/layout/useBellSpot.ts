'use client'

import { useEffect, useState } from 'react'

import { findVisibleBeacon } from '@/core/lib/beacons'
import { PLAY_INVITE_SETTINGS } from '@/declarations/play/invites'
import { NOTIFICATIONS_BEACON } from '@/declarations/ui/beacons'

/**
 * Where a bubble points at the bell
 * @typedef {Object} BellSpot
 * @property {number} left - Bubble left edge
 * @property {number} tail - Tail from the left edge
 * @property {number} edge - Distance to the bell side of the window
 * @property {boolean} isAbove - Bubble over the bell
 */

export interface BellSpot {
  left: number
  tail: number
  edge: number
  isAbove: boolean
}

// Tail inset when room allows, in pixels
const TAIL_INSET = 36

/**
 * Aim at the visible notifications bell
 * @param {boolean} isActive - Bubble shown
 * @return {BellSpot | null} - Spot, null without a bell on screen
 */

export const useBellSpot = (isActive: boolean): BellSpot | null => {
  const [spot, setSpot] = useState<BellSpot | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Follow the bell
    const place = () => {
      const bell = findVisibleBeacon(NOTIFICATIONS_BEACON)
      if (!bell) return setSpot(null)
      const box = bell.getBoundingClientRect()
      const { gapPx, edgePx } = PLAY_INVITE_SETTINGS
      const centre = box.left + box.width / 2
      const left = Math.max(edgePx, centre - TAIL_INSET)
      const isAbove = box.top > window.innerHeight / 2

      setSpot({
        left,
        tail: centre - left,
        edge: isAbove ? window.innerHeight - box.top + gapPx : box.bottom + gapPx,
        isAbove,
      })
    }

    place()
    window.addEventListener('resize', place)

    return () => window.removeEventListener('resize', place)
  }, [isActive])

  return isActive ? spot : null
}
