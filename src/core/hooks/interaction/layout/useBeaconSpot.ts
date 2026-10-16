'use client'

import { useEffect, useState } from 'react'

import { findVisibleBeacon } from '@/core/lib/beacons'
import { NUDGE_SETTINGS } from '@/declarations/configurations/settings'
import { HOME_BEACON, HOP_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * Point beside an entry
 * @typedef {Object} BeaconSpot
 * @property {number} top - Vertical centre
 * @property {number} left - Right edge plus gap
 */

export interface BeaconSpot {
  top: number
  left: number
}

/**
 * Aim at a rail entry
 * @param {boolean} isActive - Bubble shown
 * @param {string} beacon - Wanted entry
 * @return {BeaconSpot | null} - Bubble tip spot
 */

export const useBeaconSpot = (isActive: boolean, beacon: string): BeaconSpot | null => {
  const [spot, setSpot] = useState<BeaconSpot | null>(null)

  useEffect(() => {
    if (!isActive) return

    let target: HTMLElement | null = null

    // Follow the entry
    const place = () => {
      target?.removeAttribute(HOP_ATTRIBUTE)
      target = findVisibleBeacon(beacon) ?? findVisibleBeacon(HOME_BEACON)

      if (!target) {
        setSpot(null)
        return
      }

      const rect = target.getBoundingClientRect()
      target.setAttribute(HOP_ATTRIBUTE, '')
      setSpot({ top: rect.top + rect.height / 2, left: rect.right + NUDGE_SETTINGS.gapPx })
    }

    const timer = window.setTimeout(place, NUDGE_SETTINGS.delayMs)
    window.addEventListener('resize', place)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', place)
      target?.removeAttribute(HOP_ATTRIBUTE)
    }
  }, [isActive, beacon])

  return isActive ? spot : null
}
