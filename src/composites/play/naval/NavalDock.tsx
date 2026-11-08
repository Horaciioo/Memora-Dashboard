'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { locate } from '@/composites/play/naval/ocean/useOceanGestures'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import { NAVAL_SHIP_NAMES } from '@/declarations/play/naval/copy'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_PLACE } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

export interface NavalDockProps {
  fleet: number[]
  placed: number[]
  heldId: number | null
  box: RefObject<HTMLDivElement | null>
  view: { camera: NavalCamera; size: number }
  onGrab: (id: number) => void
  onDrag: (cell: OceanCell | null) => void
  onDrop: (cell: OceanCell | null) => void
}

/**
 * Ships waiting on the quay, dragged from here onto the sea
 * @param {NavalDockProps} props - Dock
 * @return {JSX.Element}
 */

export const NavalDock = ({
  fleet,
  placed,
  heldId,
  box,
  view,
  onGrab,
  onDrag,
  onDrop,
}: NavalDockProps) => {
  const isDragging = useRef(false)
  const latest = useRef({ view, onDrag, onDrop })
  useEffect(() => {
    latest.current = { view, onDrag, onDrop }
  })

  // The finger leaves the dock, the sea follows it
  useEffect(() => {
    const cellAt = (event: PointerEvent) =>
      box.current
        ? locate(
            box.current,
            { x: event.clientX, y: event.clientY },
            { ...latest.current.view, tilt: NAVAL_VIEW.tilt }
          ).cell
        : null
    const onMove = (event: PointerEvent) =>
      isDragging.current && latest.current.onDrag(cellAt(event))
    const onUp = (event: PointerEvent) => {
      if (!isDragging.current) return
      isDragging.current = false
      latest.current.onDrop(cellAt(event))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [box])

  return (
    <div className={NAVAL_PLACE.dock}>
      {fleet.map((length, id) => (
        <button
          key={id}
          type="button"
          aria-label={NAVAL_SHIP_NAMES[length]}
          className={cn(
            NAVAL_PLACE.ship,
            heldId === id && NAVAL_PLACE.shipOn,
            placed.includes(id) && heldId !== id && NAVAL_PLACE.shipDone
          )}
          onPointerDown={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId)
            isDragging.current = true
            onGrab(id)
          }}
        >
          <span className={NAVAL_PLACE.cells}>
            {Array.from({ length }, (_, cell) => (
              <i key={cell} className={NAVAL_PLACE.cellBlock} />
            ))}
          </span>
          <span className={NAVAL_PLACE.shipName}>{NAVAL_SHIP_NAMES[length]}</span>
        </button>
      ))}
    </div>
  )
}
