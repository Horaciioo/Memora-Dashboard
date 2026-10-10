'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { findVisibleBeacon } from '@/core/lib/beacons'
import { GUIDE_COPY } from '@/declarations/academy/copy'
import { GUIDE_PARAMS, PIM_DESTINATION_REGISTRY } from '@/declarations/academy/guides'
import { GUIDE_TOUR } from '@/declarations/ui/variants'

// Room around the control and between the ring and the bubble
const RING_PADDING = 6
const BUBBLE_GAP = 12

// Frames a control may take to appear
const SEARCH_FRAMES = 120

/**
 * Where the ring and the bubble sit
 * @typedef {Object} TourSpot
 * @property {DOMRect} rect - Control box
 * @property {boolean} above - Bubble goes above the control
 */

interface TourSpot {
  rect: DOMRect
  above: boolean
}

/**
 * Walkthrough opened by a task
 * @return {JSX.Element | null}
 */

export const GuideHost = () => {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const name = params.get(GUIDE_PARAMS.guide)
  const destination =
    name && PIM_DESTINATION_REGISTRY.has(name) ? PIM_DESTINATION_REGISTRY.get(name) : null
  const [index, setIndex] = useState(0)
  const [spot, setSpot] = useState<TourSpot | null>(null)
  const mark = destination?.marks[index] ?? null

  // Follow the control while the page moves
  useEffect(() => {
    if (!mark) return

    let frame = 0
    let tries = 0
    let target: HTMLElement | null = null

    const place = () => {
      target = target?.isConnected ? target : findVisibleBeacon(mark.beacon)

      if (!target) {
        tries += 1
        if (tries < SEARCH_FRAMES) frame = requestAnimationFrame(place)
        return
      }

      if (tries >= 0) {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
        tries = -1
      }

      const rect = target.getBoundingClientRect()
      setSpot({ rect, above: rect.bottom > window.innerHeight * 0.6 })
      frame = requestAnimationFrame(place)
    }

    frame = requestAnimationFrame(place)

    return () => cancelAnimationFrame(frame)
  }, [mark])

  if (!destination || !mark) return null

  // Drop the walkthrough from the address
  const close = () => {
    const next = new URLSearchParams(params.toString())
    next.delete(GUIDE_PARAMS.guide)
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    setIndex(0)
    setSpot(null)
  }

  const isLast = index === destination.marks.length - 1

  return (
    <>
      {spot && (
        <span
          className={GUIDE_TOUR.ring}
          style={{
            top: spot.rect.top - RING_PADDING,
            left: spot.rect.left - RING_PADDING,
            width: spot.rect.width + RING_PADDING * 2,
            height: spot.rect.height + RING_PADDING * 2,
          }}
          aria-hidden="true"
        />
      )}
      <div
        role="dialog"
        aria-label={destination.label}
        className={GUIDE_TOUR.bubble}
        style={
          spot
            ? {
                left: Math.max(BUBBLE_GAP, spot.rect.left),
                ...(spot.above
                  ? { bottom: window.innerHeight - spot.rect.top + BUBBLE_GAP + RING_PADDING }
                  : { top: spot.rect.bottom + BUBBLE_GAP + RING_PADDING }),
              }
            : { right: BUBBLE_GAP * 2, bottom: BUBBLE_GAP * 2 }
        }
      >
        <span className={GUIDE_TOUR.counter}>
          {GUIDE_COPY.counter
            .replace('{index}', String(index + 1))
            .replace('{total}', String(destination.marks.length))}
        </span>
        <span className={GUIDE_TOUR.title}>{mark.title}</span>
        <p className={GUIDE_TOUR.body}>{mark.body}</p>
        <div className={GUIDE_TOUR.actions}>
          <Button variant="icon" icon="close" aria-label={GUIDE_COPY.close} onClick={close} />
          <span className="flex items-center gap-2">
            {index > 0 && (
              <Button icon="back" onClick={() => setIndex(index - 1)}>
                {GUIDE_COPY.previous}
              </Button>
            )}
            <Button
              variant="primary"
              icon={isLast ? 'confirm' : 'forward'}
              onClick={() => (isLast ? close() : setIndex(index + 1))}
            >
              {isLast ? GUIDE_COPY.finish : GUIDE_COPY.next}
            </Button>
          </span>
        </div>
      </div>
    </>
  )
}
