'use client'

import { useEffect, useRef, useState } from 'react'

import { findVisibleBeacon } from '@/core/lib/beacons'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { LOADING_SELECTOR } from '@/declarations/ui/beacons'
import type { TourRect } from '@/types/tour'

/**
 * Where a beacon is, and whether it is worth waiting for
 * @typedef {Object} BeaconRect
 * @property {TourRect | null} rect - Box of the element while it shows
 * @property {boolean} isAbsent - Nothing carries it and the page has stopped loading
 */

export interface BeaconRect {
  rect: TourRect | null
  isAbsent: boolean
}

// What a beacon yields before it is looked for
const NOT_FOUND: BeaconRect = { rect: null, isAbsent: false }

// A reading remembers whose it is, so a new beacon never inherits the last one
interface Reading extends BeaconRect {
  beacon: string
}

// Moved less than this is not a move
const SAME_PX = 0.5

/**
 * Whether two boxes are the same
 * @param {TourRect | null} left - First box
 * @param {TourRect | null} right - Second box
 * @return {boolean} - Same
 */

const isSameRect = (left: TourRect | null, right: TourRect | null): boolean =>
  left === right ||
  (left !== null &&
    right !== null &&
    Math.abs(left.top - right.top) < SAME_PX &&
    Math.abs(left.left - right.left) < SAME_PX &&
    Math.abs(left.width - right.width) < SAME_PX &&
    Math.abs(left.height - right.height) < SAME_PX)

/**
 * Follow the element carrying a beacon while the page moves around it
 * @param {string | null} beacon - Beacon name, none follows nothing
 * @param {boolean} [shouldScroll] - Bring the element to the middle once found
 * @param {() => void} [onAbsent] - Called once when nothing shows it
 * @return {BeaconRect} - Box and absence
 */

export const useBeaconRect = (
  beacon: string | null,
  shouldScroll = false,
  onAbsent?: () => void
): BeaconRect => {
  const [reading, setReading] = useState<Reading | null>(null)
  const absent = useRef(onAbsent)

  // Always the latest handler
  useEffect(() => {
    absent.current = onAbsent
  }, [onAbsent])

  useEffect(() => {
    if (!beacon) return

    let frame = 0
    let isScrolled = false
    let isReported = false
    let calmSince = performance.now()

    // Look again every frame
    const look = (now: number) => {
      const target = findVisibleBeacon(beacon)

      if (target) {
        if (shouldScroll && !isScrolled) {
          target.scrollIntoView({ block: 'center', behavior: 'smooth' })
          isScrolled = true
        }

        const box = target.getBoundingClientRect()
        const rect = { top: box.top, left: box.left, width: box.width, height: box.height }
        setReading((current) =>
          current?.beacon === beacon && isSameRect(current.rect, rect) && !current.isAbsent
            ? current
            : { beacon, rect, isAbsent: false }
        )
      } else {
        // A page still drawing its skeleton is not a page without the part
        if (document.querySelector(LOADING_SELECTOR)) calmSince = now

        const isAbsent = now - calmSince > TOUR_SETTINGS.graceMs

        if (isAbsent && !isReported) {
          isReported = true
          absent.current?.()
        }
        setReading((current) =>
          current?.beacon === beacon && current.rect === null && current.isAbsent === isAbsent
            ? current
            : { beacon, rect: null, isAbsent }
        )
      }

      frame = requestAnimationFrame(look)
    }

    frame = requestAnimationFrame(look)

    return () => cancelAnimationFrame(frame)
  }, [beacon, shouldScroll])

  return beacon && reading?.beacon === beacon ? reading : NOT_FOUND
}
